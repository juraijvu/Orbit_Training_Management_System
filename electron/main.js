const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

// Database connection URLs - these would be replaced with your online database URLs
// For PostgreSQL (default)
const POSTGRES_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_rV2QkSZOMFy8@ep-jolly-rain-a4njokz1.us-east-1.aws.neon.tech/neondb?sslmode=require';

// For MySQL (Hostinger)
const MYSQL_DATABASE_URL = process.env.MYSQL_DATABASE_URL || 'mysql://u912142054_orbit_app:Orbit%40Dubai%402024@auth-db1443.hstgr.io:3306/u912142054_orbit_app';

// Set which database to use (postgres or mysql)
const DATABASE_TYPE = 'mysql';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // Set application icon
    icon: path.join(__dirname, 'icons', 'icon.png')
  });

  // Load the app
  if (isDev) {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:5173');
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Set up environment variables for the database connection
  if (DATABASE_TYPE === 'mysql') {
    process.env.MYSQL_DATABASE_URL = MYSQL_DATABASE_URL;
    console.log('Using MySQL database connection');
  } else {
    process.env.DATABASE_URL = POSTGRES_DATABASE_URL;
    console.log('Using PostgreSQL database connection');
  }

  app.on('activate', () => {
    // On macOS re-create a window when dock icon is clicked and no other windows are open
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle IPC events between renderer and main process
ipcMain.handle('show-save-dialog', async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(options);
  if (!canceled && filePath) {
    return filePath;
  }
  return null;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(options);
  if (!canceled && filePaths.length > 0) {
    return filePaths[0];
  }
  return null;
});

// File operations
ipcMain.handle('save-file', async (event, { filePath, data }) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('read-file', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
});