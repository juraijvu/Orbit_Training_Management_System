# Hostinger VPS Deployment Guide - Orbit Institute System

This guide will walk you through deploying the Orbit Institute System on your Hostinger Ubuntu VPS using WinSCP and PuTTY.

## Prerequisites
- Hostinger VPS with Ubuntu
- WinSCP for file transfer
- PuTTY for SSH access
- Root or sudo access to your VPS

## Step 1: Prepare Your Local Files

### 1.1 Download Project Files
First, you need to download all project files from Replit to your local machine:

1. In Replit, go to the file explorer
2. Click the three dots menu → "Download as zip"
3. Extract the zip file to a local folder (e.g., `C:\orbit-system\`)

### 1.2 Create Environment File
Create a `.env` file in the project root with your production settings:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/orbit_db

# Email Settings (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_key

# Other optional settings
SESSION_SECRET=your_secure_session_secret_here_make_it_long_and_random
```

## Step 2: VPS Initial Setup

### 2.1 Connect via PuTTY
1. Open PuTTY
2. Enter your VPS IP address
3. Port: 22
4. Connection type: SSH
5. Click "Open"
6. Login with your credentials

### 2.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Install Required Software
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Git (optional, for future updates)
sudo apt install git -y
```

### 2.4 Verify Installations
```bash
node --version    # Should show v20.x.x
npm --version     # Should show npm version
psql --version    # Should show PostgreSQL version
```

## Step 3: Database Setup

### 3.1 Configure PostgreSQL
```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE orbit_db;
CREATE USER orbit_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE orbit_db TO orbit_user;
ALTER USER orbit_user CREATEDB;
\q
```

Exit postgres user:
```bash
exit
```

### 3.2 Configure PostgreSQL for Remote Access (if needed)
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf

# Find and uncomment/modify:
listen_addresses = 'localhost'

# Edit pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Add this line for local connections:
local   all             orbit_user                              md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

## Step 4: Upload and Setup Application

### 4.1 Create Application Directory
```bash
sudo mkdir -p /var/www/orbit-system
sudo chown $USER:$USER /var/www/orbit-system
```

### 4.2 Upload Files via WinSCP
1. Open WinSCP
2. Connect to your VPS (same credentials as PuTTY)
3. Navigate to `/var/www/orbit-system/` on the server side
4. Upload all your project files from local machine
5. Make sure to upload the `.env` file you created

### 4.3 Set Correct Permissions
```bash
cd /var/www/orbit-system
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### 4.4 Install Dependencies
```bash
cd /var/www/orbit-system
npm install --production
```

### 4.5 Update Database URL in .env
```bash
nano .env
```

Update the DATABASE_URL:
```env
DATABASE_URL=postgresql://orbit_user:your_secure_password@localhost:5432/orbit_db
```

### 4.6 Run Database Setup
```bash
# Run database initialization - creates tables and default users
npm run db:push
```

**Note**: This creates an empty database with:
- All necessary tables (students, courses, users, etc.)
- Default admin users (admin/admin123 and superadmin/admin123)
- No existing data - you'll start fresh

### 4.7 Data Migration (Optional)
If you want to transfer data from your Replit development environment:

1. **In Replit**, run the export script:
```bash
node scripts/export-data.js
```

2. **Download the generated `data-export.json`** file

3. **Upload it to your VPS** via WinSCP to `/var/www/orbit-system/`

4. **On your VPS**, run the import script:
```bash
node scripts/import-data.js
```

## Step 5: Configure PM2 for Process Management

### 5.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'orbit-system',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

### 5.2 Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 5.3 Check Application Status
```bash
pm2 status
pm2 logs orbit-system
```

## Step 6: Configure Nginx Reverse Proxy

### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/orbit-system
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/orbit-system /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 7: Configure Firewall

### 7.1 Setup UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## Step 8: SSL Certificate (Optional but Recommended)

### 8.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 9: Final Verification

### 9.1 Check All Services
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check Nginx
sudo systemctl status nginx

# Check PM2
pm2 status

# Check application logs
pm2 logs orbit-system --lines 50
```

### 9.2 Test Application
1. Open your browser
2. Navigate to `http://your-domain.com` or `http://your-vps-ip`
3. You should see the Orbit Institute System login page

## Step 10: Maintenance Commands

### 10.1 Useful PM2 Commands
```bash
# Restart application
pm2 restart orbit-system

# Stop application
pm2 stop orbit-system

# View logs
pm2 logs orbit-system

# Monitor in real-time
pm2 monit
```

### 10.2 Update Application
When you need to update the application:

1. Upload new files via WinSCP
2. Run these commands:
```bash
cd /var/www/orbit-system
npm install --production
pm2 restart orbit-system
```

### 10.3 Database Backup
```bash
# Create backup
pg_dump -U orbit_user -h localhost orbit_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U orbit_user -h localhost orbit_db < backup_file.sql
```

## Troubleshooting

### Common Issues:

1. **Application not starting**: Check PM2 logs with `pm2 logs orbit-system`
2. **Database connection errors**: Verify DATABASE_URL in .env file
3. **Permission errors**: Check file ownership with `sudo chown -R $USER:$USER /var/www/orbit-system`
4. **Port conflicts**: Make sure port 5000 is available
5. **Nginx errors**: Check configuration with `sudo nginx -t`

### Log Locations:
- Application logs: `pm2 logs orbit-system`
- Nginx logs: `/var/log/nginx/error.log`
- PostgreSQL logs: `/var/log/postgresql/postgresql-*-main.log`

## Security Recommendations

1. **Change default passwords**: Use strong passwords for database
2. **Regular updates**: Keep system and packages updated
3. **Backup regularly**: Schedule automatic database backups
4. **Monitor logs**: Check application and system logs regularly
5. **Use SSL**: Always use HTTPS in production

## Default Login Credentials

After deployment, you can login with:
- Username: `superadmin`
- Password: `admin123`

**Important**: Change this password immediately after first login!

---

This completes the deployment process. Your Orbit Institute System should now be running on your Hostinger VPS!