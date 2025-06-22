#!/bin/bash

# Quick deployment script for Orbit Institute System
# Run this after uploading files and setting up the VPS

echo "🚀 Starting Orbit Institute System deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copying template..."
    cp deployment-scripts/.env.production .env
    echo "📝 Please edit .env file with your configuration before continuing."
    echo "Press Enter after editing .env file..."
    read
fi

# Create logs directory
mkdir -p logs

# Run database setup
echo "🗄️ Setting up database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Error: Database setup failed"
    exit 1
fi

# Copy PM2 configuration
echo "⚙️ Setting up PM2..."
cp deployment-scripts/ecosystem.config.js .

# Start application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to start application with PM2"
    exit 1
fi

# Save PM2 configuration
pm2 save

# Setup PM2 startup
echo "🔧 Setting up PM2 startup..."
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Next steps:"
echo "1. Configure Nginx (see HOSTINGER_DEPLOYMENT_GUIDE.md)"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Test your application at http://your-server-ip:5000"
echo ""
echo "📝 Useful commands:"
echo "- View logs: pm2 logs orbit-system"
echo "- Restart app: pm2 restart orbit-system"
echo "- Monitor: pm2 monit"
echo ""
echo "🔐 Default login:"
echo "Username: superadmin"
echo "Password: admin123"
echo ""
echo "⚠️  Remember to change the default password after first login!"