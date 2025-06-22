#!/bin/bash

# Orbit Institute System - VPS Setup Script
# Run this script on your Ubuntu VPS after uploading the files

echo "🚀 Starting Orbit Institute System deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install additional tools
echo "📦 Installing additional tools..."
sudo apt install git curl wget unzip -y

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/orbit-system
sudo chown $USER:$USER /var/www/orbit-system

# Configure PostgreSQL
echo "🗄️ Configuring PostgreSQL..."
sudo -i -u postgres psql << EOF
CREATE DATABASE orbit_db;
CREATE USER orbit_user WITH ENCRYPTED PASSWORD 'OrbitSecure2024!';
GRANT ALL PRIVILEGES ON DATABASE orbit_db TO orbit_user;
ALTER USER orbit_user CREATEDB;
\q
EOF

# Start and enable services
echo "🔧 Starting and enabling services..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

echo "✅ VPS setup completed!"
echo ""
echo "Next steps:"
echo "1. Upload your project files to /var/www/orbit-system/"
echo "2. Create a .env file with your configuration"
echo "3. Run: cd /var/www/orbit-system && npm install --production"
echo "4. Run: npm run db:push"
echo "5. Start with PM2: pm2 start ecosystem.config.js"
echo ""
echo "Default database credentials:"
echo "Username: orbit_user"
echo "Password: OrbitSecure2024!"
echo "Database: orbit_db"