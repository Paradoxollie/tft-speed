const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  scrapeData: () => ipcRenderer.invoke('scrape-data'),
  loadData: () => ipcRenderer.invoke('load-data')
}); 