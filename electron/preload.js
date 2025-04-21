const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File system operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', { filePath, data }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // System information
  platform: process.platform
});