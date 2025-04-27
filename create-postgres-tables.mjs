// create-postgres-tables.mjs
import { config } from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config(); // Load environment variables

async function createPostgresTables() {
  console.log('Creating PostgreSQL tables...');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in the environment variables");
    }
    
    // Connect to PostgreSQL
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Get existing tables
    const existingTablesResult = await client.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const existingTables = existingTablesResult.rows.map(row => row.tablename);
    console.log('Existing tables:', existingTables);
    
    // Define tables to create
    const tables = [
      // Users Table
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'counselor',
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT
      )`,
      
      // Students Table
      `CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE,
        registration_number TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone_no TEXT NOT NULL,
        alternative_no TEXT,
        date_of_birth DATE NOT NULL,
        passport_no TEXT,
        uid_no TEXT,
        emirates_id_no TEXT,
        emirates TEXT,
        nationality TEXT,
        education TEXT,
        gender TEXT,
        address TEXT,
        country TEXT,
        company_or_university_name TEXT,
        class_type TEXT,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        balance_due NUMERIC,
        payment_mode TEXT,
        payment_status TEXT,
        signature_data TEXT,
        terms_accepted BOOLEAN DEFAULT FALSE,
        signature_date TIMESTAMP,
        register_link TEXT,
        register_link_expiry TIMESTAMP,
        register_link_discount NUMERIC DEFAULT 0,
        register_link_course_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER
      )`,
      
      // Courses Table
      `CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        duration TEXT NOT NULL,
        fee NUMERIC NOT NULL,
        online_rate NUMERIC,
        offline_rate NUMERIC,
        private_rate NUMERIC,
        batch_rate NUMERIC,
        content TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Trainers Table
      `CREATE TABLE IF NOT EXISTS trainers (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        specialization TEXT NOT NULL,
        courses TEXT NOT NULL,
        availability TEXT NOT NULL,
        profile_pdf TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Invoices Table
      `CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number TEXT NOT NULL UNIQUE,
        student_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        payment_mode TEXT NOT NULL,
        transaction_id TEXT,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Schedules Table
      `CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        trainer_id INTEGER NOT NULL,
        student_ids TEXT NOT NULL,
        session_type TEXT NOT NULL DEFAULT 'one_to_one',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        occurrence_days TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Certificates Table
      `CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        certificate_number TEXT NOT NULL UNIQUE,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        issued_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Quotations Table
      `CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        quotation_number TEXT NOT NULL UNIQUE,
        client_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        schedule TEXT NOT NULL,
        training_venue TEXT NOT NULL,
        consultant_name TEXT NOT NULL,
        consultant_email TEXT NOT NULL,
        consultant_number TEXT NOT NULL,
        position TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        discount NUMERIC DEFAULT 0,
        final_amount NUMERIC NOT NULL,
        validity DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Quotation Items Table
      `CREATE TABLE IF NOT EXISTS quotation_items (
        id SERIAL PRIMARY KEY,
        quotation_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        duration TEXT NOT NULL,
        number_of_persons INTEGER NOT NULL,
        rate NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Registration Courses Table
      `CREATE TABLE IF NOT EXISTS registration_courses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        price NUMERIC NOT NULL,
        discount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Leads Table
      `CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        whatsapp_number TEXT,
        consultant_id INTEGER NOT NULL,
        source TEXT NOT NULL,
        interested_courses TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'New',
        priority TEXT NOT NULL DEFAULT 'Medium',
        followup_status TEXT DEFAULT 'Pending',
        notes TEXT,
        meeting_date TIMESTAMP,
        assigned_to INTEGER,
        last_contact_date TIMESTAMP,
        next_follow_up_date TIMESTAMP,
        next_follow_up_time TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    // Execute each CREATE TABLE statement
    for (const tableSQL of tables) {
      try {
        // Extract the table name from the SQL
        const tableName = tableSQL.match(/CREATE TABLE IF NOT EXISTS ([a-z_]+)/i)[1];
        console.log(`Creating table: ${tableName}`);
        
        // Execute the SQL
        await client.query(tableSQL);
        console.log(`Table ${tableName} created or already exists`);
      } catch (error) {
        console.error('Error creating table:', error.message);
      }
    }
    
    // Verify tables were created
    const tablesAfterCreation = await client.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log('Tables after creation:');
    const tableNamesAfter = tablesAfterCreation.rows.map(row => row.tablename);
    console.log(tableNamesAfter);
    
    console.log('Table creation completed successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('Error creating PostgreSQL tables:', error);
  }
}

createPostgresTables();