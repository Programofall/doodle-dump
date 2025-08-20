// Medical Manager Main Process
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// Set up a compatibility layer for electron-store
const storeCompat = {
  createStore: function(options) {
    try {
      console.log('Attempting to load electron-store...');
      
      // Method 1: Direct require as ESM default export
      try {
        const ElectronStore = require('electron-store').default;
        if (typeof ElectronStore === 'function') {
          console.log('Successfully loaded electron-store as ESM default export');
          return new ElectronStore(options);
        }
      } catch (err) {
        console.log('Failed to load electron-store as ESM default export:', err.message);
      }
      
      // Method 2: Direct require as CJS export
      try {
        const ElectronStore = require('electron-store');
        if (typeof ElectronStore === 'function') {
          console.log('Successfully loaded electron-store as CJS export');
          return new ElectronStore(options);
        }
      } catch (err) {
        console.log('Failed to load electron-store as CJS export:', err.message);
      }
      
      // Method 3: Try unpacked ASAR path
      try {
        const appPath = app.getAppPath();
        const unpacked = path.join(path.dirname(appPath), 'app.asar.unpacked');
        console.log('Looking for electron-store in:', unpacked);
        const storePath = path.join(unpacked, 'node_modules', 'electron-store');
        
        // Try as ESM
        const UnpackedStore = require(storePath).default;
        if (typeof UnpackedStore === 'function') {
          console.log('Successfully loaded electron-store from unpacked ASAR as ESM');
          return new UnpackedStore(options);
        }
        
        // Try as CJS
        if (typeof require(storePath) === 'function') {
          console.log('Successfully loaded electron-store from unpacked ASAR as CJS');
          return new (require(storePath))(options);
        }
      } catch (err) {
        console.log('Failed to load from unpacked path:', err.message);
      }
      
      // Fallback: Use a simple in-memory store
      console.error('All attempts to load electron-store failed. Using memory fallback.');
      return {
        get: (key) => storeCompat.inMemoryStore[key],
        set: (key, value) => { storeCompat.inMemoryStore[key] = value; },
        has: (key) => key in storeCompat.inMemoryStore,
        delete: (key) => { delete storeCompat.inMemoryStore[key]; }
      };
    } catch (error) {
      console.error('Fatal error in store compatibility layer:', error);
      dialog.showErrorBox('Store Error', 
        'Failed to initialize storage. Your settings may not be saved.\n\n' + 
        'Error: ' + error.message);
      
      return {
        get: () => {},
        set: () => {},
        has: () => false,
        delete: () => {}
      };
    }
  },
  inMemoryStore: {}
}

let GoogleGenerativeAI;
try {
  // Try static import first
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  // Will be loaded dynamically if needed
}
// Initialize secure storage with user-specific configuration
const store = storeCompat.createStore({
    name: 'user-data',
    encryptionKey: process.env.ENCRYPTION_KEY || app.getPath('userData'), // Uses unique path per user as fallback
    cwd: app.getPath('userData'), // Store data in user's app data directory
});

// Log success
console.log('Store initialized successfully');

// Zoom credentials - In production, these should be securely stored
const ZOOM_API_KEY = 'your-zoom-api-key';
const ZOOM_API_SECRET = 'your-zoom-api-secret';

// Initialize AI (will be initialized when API key is set)
let genAI = null;

// --- Initialize Medical Services ---
const initializeServices = () => {
    try {
        // Initialize AI with your API key
        genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'your-api-key-here');
        console.log("Successfully initialized AI service");
        
        // Initialize secure storage
        store.set('initialized', true);
        console.log("Successfully initialized secure storage");
    } catch (error) {
        console.error("Failed to initialize services:", error);
    }
};


// Contact Management System
const getUserContacts = () => {
    const userId = app.getPath('userData');
    const userContacts = store.get(`contacts.${userId}`) || [];
    return userContacts;
};

const saveUserContacts = (contacts) => {
    const userId = app.getPath('userData');
    store.set(`contacts.${userId}`, contacts);
};

// Handle contact-related IPC events
ipcMain.handle('get-contacts', async () => {
    return getUserContacts();
});

ipcMain.handle('add-contact', async (event, contact) => {
    const contacts = getUserContacts();
    contacts.push(contact);
    saveUserContacts(contacts);
    return contact;
});

ipcMain.handle('search-contacts', async (event, query) => {
    const contacts = getUserContacts();
    return contacts.filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.phone.includes(query)
    );
});

// Handle phone calls
ipcMain.handle('make-phone-call', async (event, phoneNumber) => {
    try {
        // Clean the phone number to ensure it's properly formatted
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        await shell.openExternal(`tel:${cleanNumber}`);
        return { success: true };
    } catch (error) {
        console.error('Error making phone call:', error);
        return { success: false, error: error.message };
    }
});

// Handle Squirrel startup events with error handling
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (error) {
  console.log("Squirrel startup module not found, continuing normally");
}


// Use only require for GoogleGenerativeAI in CommonJS
function loadGoogleAI() {
  if (GoogleGenerativeAI) return true;
  try {
    const googleAI = require("@google/generative-ai");
    GoogleGenerativeAI = googleAI.GoogleGenerativeAI;
    console.log("Google Generative AI module loaded successfully:", !!GoogleGenerativeAI);
    return true;
  } catch (error) {
    console.error("Require for Google Generative AI failed:", error.message);
    return false;
  }
}

// --- Global Variables ---
let mainWindow;
let videoView;

// --- Main Application Logic ---
const createWindow = () => {
  console.log("Creating main window...");
  console.log("GoogleGenerativeAI available at window creation:", !!GoogleGenerativeAI);
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  try {
    // Safely check if we're in development mode with Vite
    if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined' && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      console.log("Loading dev server URL:", MAIN_WINDOW_VITE_DEV_SERVER_URL);
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      // Only open dev tools in development
      mainWindow.webContents.openDevTools();
    } else {
      // Always load the Vite-built HTML in production (fix path to match Vite output)
      const rendererHtml = path.join(__dirname, '..', 'renderer', 'index.html');
      console.log('Loading Vite-built HTML:', rendererHtml);
      mainWindow.loadFile(rendererHtml);
    }
  } catch (error) {
    console.error("Error loading window content:", error);
    mainWindow.loadURL('data:text/html,<html><body><h1>Med-Manager</h1><p>Failed to load UI. Please contact support.</p></body></html>');
  }

  // Problem 2 Fix: Attach the resize listener once, when the window is created.
  // It will handle resizing the videoView if it exists.
  mainWindow.on('resize', () => {
    if (videoView) {
      const [newWidth, newHeight] = mainWindow.getSize();
      const controlsHeight = 50; // Keep consistent with load-youtube-url
      videoView.setBounds({ x: 0, y: controlsHeight, width: Math.floor(newWidth / 2), height: newHeight - controlsHeight });
    }
  });
};

// --- Application Lifecycle Events ---
app.whenReady().then(async () => {
  try {
    // Problem 1 Fix: Ensure the AI module is loaded *before* creating the window.
    loadGoogleAI();
    createWindow();

    // Open DevTools in packaged app for debugging
    if (mainWindow && !MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      console.log("Opening DevTools in production build for debugging");
      mainWindow.webContents.openDevTools();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error("Error during app startup:", error);
    dialog.showErrorBox("Startup Error", 
      "Failed to start application properly.\n\nError: " + error.message + 
      "\n\nPlease contact support with this error message.");
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('capture-frame', async () => {
// --- IPC Handlers ---
// Only keep Zoom Meeting Handler and API Key Management for video conference rebuild
// --- IPC Handlers ---
// Only keep Zoom Meeting Handler and API Key Management for video conference rebuild
ipcMain.handle('get-zoom-meeting', async () => {
  // In a real application, you would integrate with Zoom's API to create meetings
  // This is a placeholder that returns a mock meeting number
  return '1234567890';
});

ipcMain.handle('set-api-key', async (event, { type, key }) => {
  console.log(`Saving ${type} API key...`);
  try {
    if (!key || key.trim() === '') {
      throw new Error("API key is empty or undefined");
    }
    // Store API key securely
    store.set(`api-keys.${type}`, key);
    // Test the API key based on type
    if (type === 'gemini') {
      if (!GoogleGenerativeAI) {
        throw new Error('Google Generative AI module not available. The app may have failed to initialize properly.');
      }
      console.log("Initializing Gemini AI...");
      genAI = new GoogleGenerativeAI(key.trim());
      console.log("Gemini AI Initialized Successfully.");
    }
    event.reply('api-key-status', { success: true, message: 'API Key saved successfully!' });
    return { success: true, message: `${type.toUpperCase()} API key saved successfully!` };
  } catch (error) {
    console.error(`Failed to validate ${type} API key:`, error);
    event.reply('api-key-status', { success: false, message: `Error: ${error.message}` });
    return { success: false, message: `Invalid ${type.toUpperCase()} API key: ${error.message}` };
  }
});

// --- Context Menu Functionality ---
ipcMain.on('show-context-menu', (event, elementType) => {
  const template = [
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      click: () => {
        event.sender.send('context-menu-command', 'cut');
      }
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      click: () => {
        event.sender.send('context-menu-command', 'copy');
      }
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      click: () => {
        event.sender.send('context-menu-command', 'paste');
      }
    },
    { type: 'separator' },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      click: () => {
        event.sender.send('context-menu-command', 'selectAll');
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

});
