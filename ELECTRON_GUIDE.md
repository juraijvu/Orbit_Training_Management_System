# Orbit Institute System - Desktop Application Guide

This guide will walk you through the process of converting the Orbit Institute web application to a desktop executable (.exe) file that connects to your online database.

## Prerequisites

Before starting, make sure you have:

1. Node.js installed (v14 or later)
2. Git installed (to clone the repository)
3. A Windows computer for building a Windows executable

## Step 1: Download the Project

First, download the project from Replit:

1. Go to your Replit project
2. Click on the three dots menu in the upper right
3. Select "Download as ZIP"
4. Extract the ZIP file to a folder on your computer

Alternatively, if you have the project in a Git repository, clone it:

```bash
git clone [your-repository-url]
cd orbit-institute-system
```

## Step 2: Install Dependencies

Open a terminal/command prompt in the project folder and install the required dependencies:

```bash
npm install
```

This will install all the dependencies listed in package.json, including Electron and related packages.

## Step 3: Configure the MySQL Database Connection

Update the database connection in the Electron main file to use your Hostinger MySQL database:

1. Open `electron/main.js` in a text editor
2. Find the MySQL connection string (around line 15)
3. Replace it with your Hostinger MySQL connection details:

```javascript
// For MySQL (Hostinger)
const MYSQL_DATABASE_URL = 'mysql://u912142054_orbit_app:Orbit@Dubai@2024@auth-db1443.hstgr.io:3306/u912142054_orbit_app';

// Make sure this is set to 'mysql'
const DATABASE_TYPE = 'mysql';
```

The MySQL connection string format is: `mysql://username:password@hostname:3306/database_name`

For Orbit Institute's Hostinger database:
- Username: u912142054_orbit_app
- Password: Orbit@Dubai@2024
- Hostname: auth-db1443.hstgr.io
- Database name: u912142054_orbit_app

Your connection string (already configured above):
`mysql://u912142054_orbit_app:Orbit@Dubai@2024@auth-db1443.hstgr.io:3306/u912142054_orbit_app`

> **Note about @ character in passwords**: If your password contains special characters like the @ symbol, they need to be properly encoded in the URL. The code in the Electron app will handle this encoding automatically.

## Step 4: Prepare the Application for Electron

Run the preparation script to add Electron utilities to the client code:

```bash
# On Linux/Mac:
./electron/prepare-for-electron.sh

# On Windows:
bash electron/prepare-for-electron.sh
```

## Step 5: Build the Desktop Application

Now, build the application as a desktop executable:

```bash
# On Linux/Mac:
./electron/build-electron.sh

# On Windows:
bash electron/build-electron.sh
```

The build process will:
1. Compile the React application
2. Package it with Electron
3. Create the executable in the `electron-dist` directory

## Step 6: Find and Use the Executable

The executable will be in the `electron-dist` directory:

- On Windows: Look for `Orbit Institute System Setup.exe` - this is the installer

## Step 7: Distribute the Application

You can now distribute the executable to your users:

1. Share the installer (.exe) with your team
2. When they install it, it will create a desktop shortcut
3. The application will automatically connect to your online database

## Updating the Application

When you need to update the application:

1. Make changes to the code
2. Follow steps 4-6 again to build a new version
3. Distribute the new executable

## Troubleshooting

If you encounter issues:

- **Connection Issues**: 
  - Verify the database connection string is correct
  - Make sure the IP address of your computer/network is allowed in the Hostinger MySQL database settings
  - For Hostinger MySQL specifically:
    1. Log in to your Hostinger control panel
    2. Go to MySQL Databases
    3. Select your database (u912142054_orbit_app)
    4. Go to the "Remote Access" tab
    5. Add your current IP address or use % for any IP (less secure but helpful for testing)
  
- **Build Errors**: Make sure all dependencies are installed
- **Runtime Errors**: Check the application logs in the console
- **Special Characters in Password**: If your password contains special characters like '@', the URL encoding should be handled automatically by the application, but if you encounter issues, try manually encoding the special characters.

## Important Security Notes

The database connection string is embedded in the executable. For production use:

1. Consider implementing user authentication within the application
2. Ensure your database has proper security measures (firewalls, etc.)
3. Use connection pooling and timeout settings appropriate for desktop use

## Additional Information

- The application uses Electron, which bundles Chromium and Node.js into a single package
- The .exe file size will be larger than a typical native application (around 100-200MB)
- Updates to the application require distributing a new executable