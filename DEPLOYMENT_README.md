# Orbit Institute System - Deployment Guide

This guide explains how to deploy the Orbit Institute System across multiple platforms: Hostinger web hosting, Windows desktop application, and Android mobile app.

## Overview

The Orbit Institute System can be deployed in three ways:

1. **Web Application**: Deployed on Hostinger with MySQL database
2. **Windows Desktop Application**: Packaged as an .exe file using Electron
3. **Android Mobile App**: Packaged as an .apk file using WebView

All three deployment options connect to the same online MySQL database hosted on Hostinger, ensuring data consistency across all platforms.

## Deployment Steps

### Step 1: Deploy to Hostinger Web Hosting

First, deploy the web application to Hostinger:

1. Set up MySQL database on Hostinger
2. Upload application files
3. Configure Node.js application
4. Migrate data to MySQL database

Detailed instructions: [Hostinger Deployment Guide](HOSTINGER_GUIDE.md)

### Step 2: Create Windows Desktop Application

Once the web application is deployed, create the Windows desktop application:

1. Configure MySQL database connection in Electron
2. Build the application using Electron
3. Package as Windows installer (.exe)
4. Distribute to users

Detailed instructions: [Electron Desktop Guide](ELECTRON_GUIDE.md)

### Step 3: Create Android Mobile App

Finally, create the Android mobile app:

1. Create Android WebView project
2. Configure to connect to your hosted web application
3. Build the APK
4. Distribute to users

Detailed instructions: [Android App Guide](ANDROID_GUIDE.md)

## Database Migration

To migrate your data from PostgreSQL to MySQL, use the included migration script:

```bash
node scripts/migrate-to-mysql.js
```

Make sure to update the connection strings in the script before running it:
- `POSTGRES_DB_URL`: Your current PostgreSQL connection string
- `MYSQL_DB_URL`: Your new Hostinger MySQL connection string

## User Access

After deployment, users can access the Orbit Institute System via:

1. **Web Browser**: By visiting your Hostinger domain
2. **Windows Desktop App**: By installing the .exe file
3. **Android Mobile App**: By installing the .apk file

All platforms use the same login credentials and access the same data.

## Maintenance

### Database Backup and Restore

Regularly backup your MySQL database from Hostinger:

1. Use phpMyAdmin or MySQL Workbench to export the database
2. Store backups securely
3. Test the restore process periodically

### Application Updates

When updating the application:

1. Deploy updates to Hostinger first
2. Update the desktop application
3. Update the Android application
4. Distribute new versions to users

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify connection strings in each platform
   - Check MySQL user permissions
   - Ensure Hostinger allows remote connections

2. **Authentication Issues**:
   - Reset user passwords if needed
   - Check session configuration
   - Verify database tables for user data integrity

3. **Performance Issues**:
   - Optimize MySQL queries
   - Consider database indexing
   - Monitor Hostinger resource usage

## Support and Resources

For additional help:
- Hostinger support: https://www.hostinger.com/support
- Electron documentation: https://www.electronjs.org/docs
- Android developer documentation: https://developer.android.com/docs