#!/bin/bash

# This script adds necessary modifications to the client code to detect Electron environment

# First, check if electron folder exists
if [ ! -d "electron" ]; then
  echo "Error: electron directory not found!"
  exit 1
fi

# Create a helper utility file for Electron integration
cat > client/src/lib/electron-utils.ts << EOF
// Utility functions for Electron integration

/**
 * Checks if the application is running in Electron
 */
export const isElectron = (): boolean => {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && 
      (window.process as any)?.type === 'renderer') {
    return true;
  }

  // Check if electron is in window object
  if (typeof window !== 'undefined' && typeof window.electron !== 'undefined') {
    return true;
  }

  return false;
};

/**
 * Utility for downloading/saving files in Electron
 */
export const saveFile = async (data: string, filename: string, mimetype: string = 'text/plain'): Promise<boolean> => {
  if (isElectron() && window.electron?.saveFile && window.electron?.showSaveDialog) {
    try {
      const filePath = await window.electron.showSaveDialog({
        title: 'Save File',
        defaultPath: filename,
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (filePath) {
        return await window.electron.saveFile(filePath, data);
      }
      return false;
    } catch (error) {
      console.error('Error saving file in Electron:', error);
      return false;
    }
  } else {
    // Fallback to browser download
    const blob = new Blob([data], { type: mimetype });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    return true;
  }
};

/**
 * Utility for reading files in Electron
 */
export const readFile = async (options = {}): Promise<string | null> => {
  if (isElectron() && window.electron?.readFile && window.electron?.showOpenDialog) {
    try {
      const filePath = await window.electron.showOpenDialog({
        title: 'Open File',
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ],
        ...options
      });
      
      if (filePath) {
        return await window.electron.readFile(filePath);
      }
      return null;
    } catch (error) {
      console.error('Error reading file in Electron:', error);
      return null;
    }
  }
  return null;
};
EOF

# Create TypeScript declarations for Electron window object
cat > client/src/lib/electron.d.ts << EOF
interface ElectronAPI {
  showSaveDialog: (options: any) => Promise<string | null>;
  showOpenDialog: (options: any) => Promise<string | null>;
  saveFile: (filePath: string, data: string) => Promise<boolean>;
  readFile: (filePath: string) => Promise<string>;
  platform: string;
}

// Extend the Window interface
declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
EOF

echo "Electron integration files created successfully!"