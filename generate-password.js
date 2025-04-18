/**
 * Utility script to generate hashed passwords for the Orbit Institute System
 * This can be used to create passwords for new users or reset existing ones
 * 
 * Usage: node generate-password.js <password>
 * Example: node generate-password.js mySecurePassword
 */

const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const password = process.argv[2] || 'password';
  
  if (!password) {
    console.error('Please provide a password as an argument');
    process.exit(1);
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    console.log('\n=== PASSWORD HASH GENERATOR ===');
    console.log(`Original Password: ${password}`);
    console.log(`Hashed Password: ${hashedPassword}`);
    console.log('\nSQL for inserting a new user:');
    console.log(`INSERT INTO users (username, password, role, full_name, email) VALUES ('newuser', '${hashedPassword}', 'user', 'New User', 'user@example.com');`);
    console.log('\nSQL for updating an existing user:');
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'username';`);
    console.log('==============================\n');
  } catch (error) {
    console.error('Error generating password hash:', error);
  }
}

// Run the main function
main();