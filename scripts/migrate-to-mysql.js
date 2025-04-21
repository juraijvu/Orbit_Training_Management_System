/**
 * Migration script to transfer data from PostgreSQL to MySQL
 * 
 * This script exports all data from the PostgreSQL database and imports it into a MySQL database.
 * It requires both database connection strings to be set:
 * - DATABASE_URL: PostgreSQL connection string
 * - MYSQL_DATABASE_URL: MySQL connection string
 */

const { Pool } = require('@neondatabase/serverless');
const mysql = require('mysql2/promise');
const fs = require('fs');

// Database connection strings
const POSTGRES_DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rV2QkSZOMFy8@ep-jolly-rain-a4njokz1.us-east-1.aws.neon.tech/neondb?sslmode=require';
const MYSQL_DB_URL = process.env.MYSQL_DATABASE_URL || 'mysql://username:password@hostname:3306/database_name';

// Connect to PostgreSQL
const postgresPool = new Pool({ connectionString: POSTGRES_DB_URL });

// Connect to MySQL
const mysqlPool = mysql.createPool(MYSQL_DB_URL);

// Tables to migrate - in order of dependencies
const TABLES = [
  'users',
  'courses',
  'leads',
  'trainers',
  'registration_links',
  'students',
  'registration_courses',
  'invoices',
  'schedules',
  'schedule_students',
  'certificates',
  'chatbot_flows',
  'chatbot_nodes',
  'chatbot_conditions',
  'chatbot_actions',
  'chatbot_sessions',
  'canned_responses',
  'expenses',
  'employees',
  'attendance_records'
];

// Function to execute a query on PostgreSQL
async function executePostgresQuery(query, params = []) {
  const client = await postgresPool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Function to execute a query on MySQL
async function executeMysqlQuery(query, params = []) {
  const connection = await mysqlPool.getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

// Function to get table schema from PostgreSQL
async function getPostgresTableSchema(tableName) {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `;
  return await executePostgresQuery(query, [tableName]);
}

// Function to create a table in MySQL based on PostgreSQL schema
async function createMySqlTable(tableName, schema) {
  // Map PostgreSQL data types to MySQL data types
  const dataTypeMap = {
    'integer': 'INT',
    'text': 'TEXT',
    'character varying': 'VARCHAR(255)',
    'boolean': 'BOOLEAN',
    'timestamp with time zone': 'DATETIME',
    'timestamp without time zone': 'DATETIME',
    'double precision': 'DOUBLE',
    'jsonb': 'JSON',
    'uuid': 'VARCHAR(36)',
    'date': 'DATE',
    'time without time zone': 'TIME'
  };
  
  // Create the table SQL
  const columns = schema.map(column => {
    const dataType = dataTypeMap[column.data_type] || 'TEXT';
    const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    
    // Handle special cases for default values
    let defaultValue = '';
    if (column.column_default) {
      // Skip sequence defaults as MySQL handles auto increment differently
      if (!column.column_default.includes('nextval')) {
        defaultValue = `DEFAULT ${column.column_default.replace('::text', '')}`;
      }
    }
    
    return `\`${column.column_name}\` ${dataType} ${nullable} ${defaultValue}`.trim();
  });
  
  // Add primary key for id column if it exists
  if (schema.some(col => col.column_name === 'id')) {
    columns.push('PRIMARY KEY (`id`)');
  }
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      ${columns.join(',\n      ')}
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  // Drop the table if it exists (for clean migration)
  await executeMysqlQuery(`DROP TABLE IF EXISTS \`${tableName}\``);
  
  // Create the table
  await executeMysqlQuery(createTableSQL);
  console.log(`Created table ${tableName} in MySQL`);
}

// Function to migrate data from PostgreSQL to MySQL
async function migrateTableData(tableName) {
  // Get all data from PostgreSQL
  const pgData = await executePostgresQuery(`SELECT * FROM ${tableName}`);
  
  if (pgData.length === 0) {
    console.log(`No data to migrate for table ${tableName}`);
    return 0;
  }
  
  // Get column names from the first row
  const columns = Object.keys(pgData[0]);
  
  // Prepare batch insert statements
  const BATCH_SIZE = 100;
  const batches = [];
  
  for (let i = 0; i < pgData.length; i += BATCH_SIZE) {
    batches.push(pgData.slice(i, i + BATCH_SIZE));
  }
  
  let totalInserted = 0;
  
  for (const batch of batches) {
    const placeholders = batch.map(row => 
      `(${columns.map(() => '?').join(', ')})`
    ).join(', ');
    
    const values = [];
    batch.forEach(row => {
      columns.forEach(col => {
        // Convert any JSON objects to strings
        if (typeof row[col] === 'object' && row[col] !== null) {
          values.push(JSON.stringify(row[col]));
        } else {
          values.push(row[col]);
        }
      });
    });
    
    const insertSQL = `
      INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`)
      VALUES ${placeholders};
    `;
    
    await executeMysqlQuery(insertSQL, values);
    totalInserted += batch.length;
  }
  
  console.log(`Migrated ${totalInserted} rows to ${tableName}`);
  return totalInserted;
}

// Set auto increment values for tables
async function setAutoIncrementValues(tableName) {
  try {
    // Get the max ID value
    const maxIdResult = await executeMysqlQuery(`SELECT MAX(id) as max_id FROM \`${tableName}\``);
    const maxId = maxIdResult[0].max_id || 0;
    
    if (maxId > 0) {
      // Set the auto increment value to max ID + 1
      await executeMysqlQuery(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${maxId + 1}`);
      console.log(`Set AUTO_INCREMENT for ${tableName} to ${maxId + 1}`);
    }
  } catch (error) {
    console.error(`Error setting auto increment for ${tableName}:`, error.message);
  }
}

// Main migration function
async function migrateDatabases() {
  try {
    console.log('Starting database migration from PostgreSQL to MySQL...');
    
    // Create migration log
    const logStream = fs.createWriteStream('migration_log.txt', {flags: 'w'});
    const originalConsoleLog = console.log;
    console.log = function(message) {
      logStream.write(message + '\n');
      originalConsoleLog(message);
    };
    
    // Migrate each table
    let totalMigrated = 0;
    
    for (const tableName of TABLES) {
      try {
        console.log(`\n--- Migrating table: ${tableName} ---`);
        
        // Get schema from PostgreSQL
        const schema = await getPostgresTableSchema(tableName);
        
        // Create table in MySQL
        await createMySqlTable(tableName, schema);
        
        // Migrate data
        const rowsMigrated = await migrateTableData(tableName);
        totalMigrated += rowsMigrated;
        
        // Set auto increment values
        await setAutoIncrementValues(tableName);
      } catch (error) {
        console.error(`Error migrating table ${tableName}:`, error);
      }
    }
    
    console.log(`\nMigration complete! Total rows migrated: ${totalMigrated}`);
    
    // Restore console.log and close log stream
    console.log = originalConsoleLog;
    logStream.end();
    
    // Close database connections
    await postgresPool.end();
    await mysqlPool.end();
    
    console.log('Database connections closed. Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateDatabases();