/**
 * Script to create default admin and superadmin users
 * Run this script after setting up your database locally
 */

const { pool } = require('../server/db');
const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createDefaultUsers() {
  try {
    console.log('Creating default users...');
    
    // Check if admin exists
    const adminResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminResult.rows.length === 0) {
      // Create admin user
      const adminPassword = await hashPassword('password');
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['admin', adminPassword, 'admin']
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if superadmin exists
    const superadminResult = await pool.query('SELECT * FROM users WHERE username = $1', ['superadmin']);
    if (superadminResult.rows.length === 0) {
      // Create superadmin user
      const superadminPassword = await hashPassword('password');
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        ['superadmin', superadminPassword, 'superadmin']
      );
      console.log('Superadmin user created successfully');
    } else {
      console.log('Superadmin user already exists');
    }
    
    console.log('Default users setup complete');
  } catch (error) {
    console.error('Error creating default users:', error);
  } finally {
    await pool.end();
  }
}

createDefaultUsers();