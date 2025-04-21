# Orbit Institute System - Desktop Application

This directory contains the files needed to build the Orbit Institute System as a desktop application (.exe) using Electron.

## Building the Desktop Application

To build the desktop application, follow these steps:

### 1. Prepare the Client for Electron

First, run the preparation script to add Electron-specific utilities to the client:

```bash
./electron/prepare-for-electron.sh
```

This script adds utility functions that help the web application detect if it's running in Electron and use native file dialogs.

### 2. Build the Application

Run the build script to create the desktop application:

```bash
./electron/build-electron.sh
```

This script will:
1. Build the React application
2. Package it with Electron
3. Create an executable in the `electron-dist` directory

### 3. Find the Executable

The final executable will be in the `electron-dist` directory. On Windows, you'll find:
- An installer (.exe) for Windows

## Important Notes for Distribution

### Database Connection

The application is configured to connect to your online database specified in the `main.js` file. Make sure this connection string is updated before building the application for distribution.

### Updates

When you need to update the application:
1. Make your changes to the code
2. Re-run the build scripts
3. Distribute the new executable to users

## Troubleshooting

If you encounter any issues:
1. Check the console output for error messages
2. Verify that the database connection string is correct
3. Ensure all dependencies are installed

## Security Considerations

The database connection string is embedded in the application. While it's not easily accessible to casual users, it's not completely secure. Consider using additional security measures for production deployments.