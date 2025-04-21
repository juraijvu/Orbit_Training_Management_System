# Deploying Orbit Institute System to Hostinger

This guide will help you deploy the Orbit Institute System to Hostinger web hosting with MySQL database support.

## Prerequisites

- A Hostinger account with:
  - Web hosting plan
  - MySQL database
  - Node.js support
- FTP client (like FileZilla) or Git access
- The Orbit Institute System codebase

## Step 1: Set Up MySQL Database on Hostinger

1. Log in to your Hostinger control panel
2. Navigate to the MySQL Databases section
3. Create a new database:
   - Choose a database name (e.g., `orbitinstitute`)
   - Create a username and strong password
   - Assign all privileges to the user
4. Note down these database credentials:
   - Database name
   - Username
   - Password
   - Hostname (usually provided by Hostinger)

## Step 2: Prepare Your Application

1. Update the database connection in your application to use MySQL:
   - Open `server/mysql-db.ts`
   - Update the `CONNECTION_STRING` with your Hostinger MySQL details:
   ```typescript
   const CONNECTION_STRING = 'mysql://username:password@hostname:3306/database_name';
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   USE_MYSQL=true
   MYSQL_DATABASE_URL=mysql://username:password@hostname:3306/database_name
   SESSION_SECRET=a-long-random-string-for-security
   ```

3. Build the application for production:
   ```bash
   npm run build
   ```

## Step 3: Upload Files to Hostinger

### Option 1: Using FTP

1. Connect to your Hostinger account using an FTP client:
   - Host: Your FTP hostname (from Hostinger)
   - Username: Your Hostinger username
   - Password: Your Hostinger password
   - Port: 21

2. Upload the following files and directories to your Hostinger web space:
   - `dist/` directory (contains the built application)
   - `server/` directory (contains server-side code)
   - `shared/` directory (contains shared schema)
   - `package.json` and `package-lock.json`
   - `.env` file
   - Any other necessary configuration files

### Option 2: Using Git (if supported by your Hostinger plan)

1. Initialize a Git repository in your project folder (if not already done):
   ```bash
   git init
   ```

2. Create a `.gitignore` file to exclude unnecessary files:
   ```
   node_modules/
   .DS_Store
   ```

3. Add and commit your files:
   ```bash
   git add .
   git commit -m "Initial deployment"
   ```

4. Add your Hostinger Git repository as a remote:
   ```bash
   git remote add hostinger ssh://your-hostinger-git-url
   ```

5. Push your code:
   ```bash
   git push hostinger master
   ```

## Step 4: Install Dependencies on Hostinger

Connect to your Hostinger account via SSH (if available) or use the Hostinger terminal:

```bash
cd /path/to/your/application
npm install --production
```

## Step 5: Set Up Node.js Application

If Hostinger provides a Node.js setup interface:

1. Navigate to the Node.js section in your Hostinger control panel
2. Configure your application:
   - Entry point: `dist/index.js`
   - Node.js version: 18.x or higher
   - Environment variables: Copy from your `.env` file

If setting up manually, create a startup script or use PM2 (if available):

```bash
npm install -g pm2
pm2 start dist/index.js --name "orbit-institute"
pm2 save
```

## Step 6: Configure Domain and SSL

1. In your Hostinger control panel, assign your domain to the application
2. Enable SSL certificate for your domain
3. Ensure that your application is configured to use HTTPS

## Step 7: Migrate Database Data

Run the MySQL migration script to transfer your data to the Hostinger MySQL database:

1. Update the database connection strings in `scripts/migrate-to-mysql.js`
2. Run the migration:
   ```bash
   node scripts/migrate-to-mysql.js
   ```

## Step 8: Test Your Application

1. Visit your domain in a web browser
2. Verify all functionality works correctly:
   - Log in with default credentials
   - Check that data is correctly displayed
   - Test CRUD operations to ensure database connection is working

## Troubleshooting

### Database Connection Issues
- Verify MySQL credentials are correct
- Check if remote connections are allowed for your database
- Ensure the proper database privileges are set for your user

### 500 Server Errors
- Check server logs in the Hostinger control panel
- Verify Node.js version compatibility
- Check if all required packages are installed

### Application Not Starting
- Ensure entry point is correctly set
- Check for environment variables that might be missing
- Verify port configuration (Hostinger may require specific ports)

## Maintenance

1. **Updates**: When updating your application:
   - Test changes locally
   - Build the application
   - Upload only the changed files or push changes via Git
   - Restart the Node.js application

2. **Backups**: Regularly backup your:
   - Database (via MySQL export or Hostinger backup tools)
   - Application files (via FTP download or Git)

3. **Monitoring**: Use Hostinger's monitoring tools or set up your own to track:
   - Server uptime
   - Resource usage
   - Error rates