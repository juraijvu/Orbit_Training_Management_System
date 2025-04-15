import crypto from 'crypto';
import { promisify } from 'util';

async function hashPassword(password) {
  const scryptAsync = promisify(crypto.scrypt);
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

hashPassword('password').then(hash => {
  console.log('Hashed password:', hash);
});