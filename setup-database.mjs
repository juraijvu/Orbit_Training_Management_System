// setup-database.mjs
import { config } from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config(); // Load environment variables

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in the environment variables");
    }
    
    // Connect to PostgreSQL
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();
    console.log('Connected to database');
    
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
      )`,
      
      // Session table for authentication
      `CREATE TABLE IF NOT EXISTS session (
        sid TEXT NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
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
    
    // Insert default users if they don't exist
    const adminExists = await client.query(`
      SELECT id FROM users WHERE username = 'admin'
    `);
    
    if (adminExists.rowCount === 0) {
      console.log('Creating admin user...');
      await client.query(`
        INSERT INTO users (username, password, role, full_name)
        VALUES (
          'admin', 
          'fef32d5c7624a9d017b8acd8b5862c7ebbdcc0751813611a9b915b6c9c771f1f.7fbfdb6b43dfabf5ec49ff7a246a7262', 
          'admin', 
          'Admin User'
        )
      `);
    } else {
      console.log('Admin user already exists');
    }
    
    const superadminExists = await client.query(`
      SELECT id FROM users WHERE username = 'superadmin'
    `);
    
    if (superadminExists.rowCount === 0) {
      console.log('Creating superadmin user...');
      await client.query(`
        INSERT INTO users (username, password, role, full_name)
        VALUES (
          'superadmin', 
          'fef32d5c7624a9d017b8acd8b5862c7ebbdcc0751813611a9b915b6c9c771f1f.7fbfdb6b43dfabf5ec49ff7a246a7262', 
          'superadmin', 
          'Super Admin User'
        )
      `);
    } else {
      console.log('Superadmin user already exists');
    }
    
    // Insert sample courses if they don't exist
    const coursesExist = await client.query(`
      SELECT id FROM courses LIMIT 1
    `);
    
    if (coursesExist.rowCount === 0) {
      console.log('Creating sample courses...');
      const sampleCourses = [
        {
          name: 'Web Development Fundamentals',
          description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
          duration: '4 weeks',
          fee: 1500,
          online_rate: 1200,
          offline_rate: 1500,
          private_rate: 2500,
          batch_rate: 1200,
          content: JSON.stringify({
            week1: 'HTML Basics',
            week2: 'CSS Styling',
            week3: 'JavaScript Fundamentals',
            week4: 'Building a complete website'
          }),
          active: true
        },
        {
          name: 'Advanced JavaScript',
          description: 'Master JavaScript with advanced concepts including ES6+, async programming, and frameworks.',
          duration: '6 weeks',
          fee: 2000,
          online_rate: 1700,
          offline_rate: 2000,
          private_rate: 3200,
          batch_rate: 1700,
          content: JSON.stringify({
            week1: 'ES6+ Features',
            week2: 'Promises and Async/Await',
            week3: 'DOM Manipulation',
            week4: 'Working with APIs',
            week5: 'React Basics',
            week6: 'Building a React Application'
          }),
          active: true
        },
        {
          name: 'UX/UI Design',
          description: 'Learn user experience and user interface design principles and techniques.',
          duration: '5 weeks',
          fee: 1800,
          online_rate: 1500,
          offline_rate: 1800,
          private_rate: 2800,
          batch_rate: 1500,
          content: JSON.stringify({
            week1: 'Design Fundamentals',
            week2: 'User Research',
            week3: 'Wireframing and Prototyping',
            week4: 'Visual Design',
            week5: 'Design Systems'
          }),
          active: true
        }
      ];
      
      for (const course of sampleCourses) {
        await client.query(`
          INSERT INTO courses (name, description, duration, fee, online_rate, offline_rate, private_rate, batch_rate, content, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          course.name, 
          course.description, 
          course.duration, 
          course.fee, 
          course.online_rate, 
          course.offline_rate, 
          course.private_rate, 
          course.batch_rate, 
          course.content, 
          course.active
        ]);
      }
    } else {
      console.log('Sample courses already exist');
    }
    
    // Insert sample trainers if they don't exist
    const trainersExist = await client.query(`
      SELECT id FROM trainers LIMIT 1
    `);
    
    if (trainersExist.rowCount === 0) {
      console.log('Creating sample trainers...');
      const sampleTrainers = [
        {
          full_name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+971501234567',
          specialization: 'Web Development',
          courses: '1,2',
          availability: JSON.stringify({
            monday: ['9:00-12:00', '14:00-17:00'],
            tuesday: ['9:00-12:00', '14:00-17:00'],
            wednesday: ['9:00-12:00'],
            thursday: ['14:00-17:00'],
            friday: ['9:00-12:00']
          })
        },
        {
          full_name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+971502345678',
          specialization: 'UX/UI Design',
          courses: '3',
          availability: JSON.stringify({
            monday: ['10:00-13:00'],
            tuesday: ['10:00-13:00', '15:00-18:00'],
            wednesday: ['10:00-13:00', '15:00-18:00'],
            thursday: ['10:00-13:00'],
            friday: []
          })
        }
      ];
      
      for (const trainer of sampleTrainers) {
        await client.query(`
          INSERT INTO trainers (full_name, email, phone, specialization, courses, availability)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          trainer.full_name, 
          trainer.email, 
          trainer.phone, 
          trainer.specialization, 
          trainer.courses, 
          trainer.availability
        ]);
      }
    } else {
      console.log('Sample trainers already exist');
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
    
    console.log('Database setup completed successfully!');
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();