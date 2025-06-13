"use strict";

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// --- Configuration ---
const DATA_URL = 'https://www.metatft.com/comps';
const DATA_DIR = path.join(app.getPath('userData'), 'data');
const COMPS_FILE = path.join(DATA_DIR, 'compositions.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers ---

ipcMain.handle('scrape-data', async () => {
  let browser;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(DATA_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('div[class*="CompTable_row"]', { timeout: 20000 });

    const data = await page.evaluate(() => {
      const patch = document.querySelector('h1[class*="Header_patch"]')?.innerText.match(/(\d+\.\d+)/)?.[1] || 'N/A';
      const compositions = [];
      document.querySelectorAll('div[class*="CompTable_row"]').forEach(row => {
        const name = row.querySelector('div[class*="CompTable_compName"]')?.innerText;
        const tier = row.querySelector('div[class*="CompTable_tier"] span')?.innerText;
        const champions = Array.from(row.querySelectorAll('div[class*="CompTable_champions"] img')).map(img => img.alt);
        if (name && champions.length > 0) compositions.push({ name, tier, champions });
      });
      return { patch, lastUpdated: new Date().toISOString(), compositions };
    });

    fs.writeFileSync(COMPS_FILE, JSON.stringify(data, null, 2));
    return { success: true, patch: data.patch, count: data.compositions.length };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
});

ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(COMPS_FILE)) {
      const content = fs.readFileSync(COMPS_FILE, 'utf-8');
      return { success: true, data: JSON.parse(content) };
    }
    return { success: false, error: 'Fichier de données non trouvé.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}); 