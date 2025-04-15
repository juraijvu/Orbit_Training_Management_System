import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    // Check if admin user exists
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (adminUser.length === 0) {
      console.log("Creating admin user...");
      
      await db.insert(users).values({
        username: "admin",
        password: await hashPassword("password"),
        role: "admin",
        fullName: "Admin User",
        email: "admin@orbitinstitute.com",
        phone: "+971 123456789"
      });
      
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }
    
    // Check if superadmin user exists
    const superAdminUser = await db.select().from(users).where(eq(users.username, 'superadmin'));
    
    if (superAdminUser.length === 0) {
      console.log("Creating superadmin user...");
      
      await db.insert(users).values({
        username: "superadmin",
        password: await hashPassword("password"),
        role: "superadmin",
        fullName: "Super Admin",
        email: "superadmin@orbitinstitute.com",
        phone: "+971 987654321"
      });
      
      console.log("Superadmin user created successfully!");
    } else {
      console.log("Superadmin user already exists.");
    }
    
    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedUsers();