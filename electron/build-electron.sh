#!/bin/bash

# Build the application
echo "Building the React application..."
npm run build

# Create the electron build directory
mkdir -p electron/dist-electron

# Copy necessary files
echo "Copying files for Electron packaging..."
cp -r dist electron/dist-electron/
cp -r electron/icons electron/dist-electron/

# Create electron-builder.yml configuration
cat > electron-builder.yml << EOF
appId: com.orbitinstitute.management
productName: Orbit Institute System
directories:
  output: electron-dist
  buildResources: electron/icons
files:
  - from: electron/dist-electron
  - electron/main.js
  - electron/preload.js
win:
  target: nsis
  icon: electron/icons/icon.png
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
EOF

# Build the Electron application
echo "Building the Electron application..."
npx electron-builder --dir

echo "Build complete! You can find the executable in the electron-dist directory."