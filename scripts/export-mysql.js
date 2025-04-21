/**
 * Export MySQL database script
 * 
 * This script creates a MySQL-compatible SQL export of the current database.
 * Run with: npx tsx scripts/export-mysql.js
 */
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import ws from 'ws';

// Configure Neon to use WebSockets
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Create a database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const MYSQL_EXPORT_FILENAME = 'orbit_institute_mysql_export.sql';

async function exportMySql() {
  console.log('Starting MySQL export process...');
  
  try {
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables to export`);
    
    let mysqlScript = '-- MySQL Export for Orbit Institute System\n';
    mysqlScript += '-- Generated: ' + new Date().toISOString() + '\n\n';
    
    // Add MySQL-specific settings
    mysqlScript += 'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n';
    mysqlScript += 'SET FOREIGN_KEY_CHECKS = 0;\n';
    mysqlScript += 'SET time_zone = "+00:00";\n\n';
    
    for (const table of tables) {
      console.log(`Processing table: ${table}`);
      
      // Get table structure
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, 
               column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      // Create DROP TABLE statement
      mysqlScript += `-- Table structure for table \`${table}\`\n\n`;
      mysqlScript += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      
      // Start CREATE TABLE statement
      mysqlScript += `CREATE TABLE \`${table}\` (\n`;
      
      // Process columns
      const columnDefinitions = [];
      
      for (const col of columnsResult.rows) {
        let type = col.data_type;
        let colDef = `  \`${col.column_name}\` `;
        
        // Convert PostgreSQL types to MySQL types
        switch (type) {
          case 'integer':
            colDef += 'int';
            break;
          case 'bigint':
            colDef += 'bigint';
            break;
          case 'character varying':
            colDef += `varchar(${col.character_maximum_length || 255})`;
            break;
          case 'text':
            colDef += 'text';
            break;
          case 'boolean':
            colDef += 'tinyint(1)';
            break;
          case 'timestamp with time zone':
            colDef += 'datetime';
            break;
          case 'timestamp without time zone':
            colDef += 'datetime';
            break;
          case 'date':
            colDef += 'date';
            break;
          case 'jsonb':
          case 'json':
            colDef += 'json';
            break;
          case 'double precision':
            colDef += 'double';
            break;
          default:
            colDef += 'varchar(255)';
        }
        
        // Add NOT NULL if required
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        // Handle default values
        if (col.column_default) {
          // Skip serial defaults
          if (!col.column_default.includes('nextval')) {
            let defaultVal = col.column_default;
            
            // Handle now() function for timestamps
            if (defaultVal.includes('now()')) {
              colDef += ` DEFAULT CURRENT_TIMESTAMP`;
            } else {
              // Clean up default value
              if (defaultVal.startsWith("'") && defaultVal.endsWith("'")) {
                defaultVal = defaultVal.slice(1, -1);
              }
              
              // Handle boolean defaults
              if (defaultVal === 'true') defaultVal = '1';
              if (defaultVal === 'false') defaultVal = '0';
              
              colDef += ` DEFAULT '${defaultVal}'`;
            }
          }
        }
        
        columnDefinitions.push(colDef);
      }
      
      // Get primary key
      try {
        const pkResult = await pool.query(`
          SELECT a.attname
          FROM pg_index i
          JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
          WHERE i.indrelid = $1::regclass
          AND i.indisprimary
        `, [`public.${table}`]);
        
        if (pkResult.rows.length > 0) {
          const primaryKeys = pkResult.rows.map(row => row.attname);
          columnDefinitions.push(`  PRIMARY KEY (\`${primaryKeys.join('`, `')}\`)`);
          
          // Mark auto-increment for id columns
          const idColIndex = columnsResult.rows.findIndex(col => 
            col.column_name === 'id' && 
            (col.column_default || '').includes('nextval')
          );
          
          if (idColIndex >= 0) {
            const idCol = columnsResult.rows[idColIndex];
            // Replace the id column definition with AUTO_INCREMENT
            columnDefinitions[idColIndex] = columnDefinitions[idColIndex].replace('int', 'int AUTO_INCREMENT');
          }
        }
      } catch (err) {
        console.error(`Error getting primary key for ${table}:`, err.message);
      }
      
      // Finish CREATE TABLE
      mysqlScript += columnDefinitions.join(',\n');
      mysqlScript += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';
      
      // Get data
      const dataResult = await pool.query(`SELECT * FROM "${table}"`);
      
      if (dataResult.rows.length > 0) {
        console.log(`Exporting ${dataResult.rows.length} rows from ${table}`);
        mysqlScript += `-- Dumping data for table \`${table}\`\n\n`;
        
        // Generate INSERT statements in batches of 100
        const batchSize = 100;
        for (let i = 0; i < dataResult.rows.length; i += batchSize) {
          const batch = dataResult.rows.slice(i, i + batchSize);
          
          // Get column names
          const columnNames = Object.keys(batch[0])
            .map(col => `\`${col}\``)
            .join(', ');
          
          mysqlScript += `INSERT INTO \`${table}\` (${columnNames}) VALUES\n`;
          
          // Process row values
          const rowsValues = batch.map(row => {
            const rowValues = Object.values(row).map(val => {
              if (val === null) {
                return 'NULL';
              }
              
              if (typeof val === 'string') {
                // Escape string values
                return `'${val.replace(/'/g, "''")}'`;
              }
              
              if (typeof val === 'boolean') {
                return val ? '1' : '0';
              }
              
              if (val instanceof Date) {
                return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
              }
              
              if (typeof val === 'object') {
                // Handle JSON values
                return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              }
              
              return val;
            });
            
            return `(${rowValues.join(', ')})`;
          });
          
          mysqlScript += rowsValues.join(',\n');
          mysqlScript += ';\n\n';
        }
      }
    }
    
    // Re-enable foreign key checks
    mysqlScript += 'SET FOREIGN_KEY_CHECKS = 1;\n';
    
    // Write to file
    fs.writeFileSync(MYSQL_EXPORT_FILENAME, mysqlScript);
    console.log(`MySQL export created successfully: ${MYSQL_EXPORT_FILENAME}`);
    
  } catch (err) {
    console.error('Error generating MySQL export:', err);
  } finally {
    await pool.end();
  }
}

exportMySql().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});