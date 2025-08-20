// Medical Manager Preload Script
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Set up a compatibility layer for electron-store
const storeCompat = {
  createStore: function(options) {
    try {
      console.log('Preload: Attempting to load electron-store...');
      
      // Method 1: Direct require as ESM default export
      try {
        const ElectronStore = require('electron-store').default;
        if (typeof ElectronStore === 'function') {
          console.log('Preload: Successfully loaded electron-store as ESM default export');
          return new ElectronStore(options);
        }
      } catch (err) {
        console.log('Preload: Failed to load electron-store as ESM default export:', err.message);
      }
      
      // Method 2: Direct require as CJS export
      try {
        const ElectronStore = require('electron-store');
        if (typeof ElectronStore === 'function') {
          console.log('Preload: Successfully loaded electron-store as CJS export');
          return new ElectronStore(options);
        }
      } catch (err) {
        console.log('Preload: Failed to load electron-store as CJS export:', err.message);
      }
      
      // Fallback: Use a simple in-memory store
      console.warn('Preload: All attempts to load electron-store failed. Using memory fallback.');
      return {
        get: (key) => storeCompat.inMemoryStore[key],
        set: (key, value) => { storeCompat.inMemoryStore[key] = value; },
        has: (key) => key in storeCompat.inMemoryStore,
        delete: (key) => { delete storeCompat.inMemoryStore[key]; }
      };
    } catch (error) {
      console.error('Preload: Fatal error in store compatibility layer:', error);
      return {
        get: () => {},
        set: () => {},
        has: () => false,
        delete: () => {}
      };
    }
  },
  inMemoryStore: {}
};

// Initialize store with encryption for medical data
const store = storeCompat.createStore({
  encryptionKey: 'your-encryption-key', // Replace with a secure key in production
  name: 'medical-data'
});

// This creates the secure bridge and exposes our functions to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Contact Management
    getContacts: () => ipcRenderer.invoke('get-contacts'),
    addContact: (contact) => ipcRenderer.invoke('add-contact', contact),
    searchContacts: (query) => ipcRenderer.invoke('search-contacts', query),
    makePhoneCall: (phoneNumber) => ipcRenderer.invoke('make-phone-call', phoneNumber),

    // Telehealth/Zoom Integration
    getZoomMeeting: () => ipcRenderer.invoke('get-zoom-meeting'),
    
    // Medical Records Management
    saveMedicalRecords: (records) => ipcRenderer.invoke('save-medical-records', records),
    loadMedicalRecords: () => ipcRenderer.invoke('load-medical-records'),
    
    // Appointment Management
    scheduleAppointment: (appointment) => ipcRenderer.invoke('schedule-appointment', appointment),
    getAppointments: () => ipcRenderer.invoke('get-appointments'),
    
    // AI Medical Assistant
    askMedicalAssistant: (query) => ipcRenderer.invoke('ask-medical-assistant', query),
    
    // API Key Management (for AI and Zoom integration)
    setApiKey: (apiType, apiKey) => ipcRenderer.invoke('set-api-key', { type: apiType, key: apiKey }),
    getApiKey: (apiType) => ipcRenderer.invoke('get-api-key', apiType),
    onApiKeyStatus: (callback) => ipcRenderer.on('api-key-status', (_event, value) => callback(value)),
    
    // Context Menu for Text Fields
    showContextMenu: (elementType) => ipcRenderer.send('show-context-menu', elementType),
    onContextMenuCommand: (callback) => ipcRenderer.on('context-menu-command', (_event, command) => callback(command)),

    // Secure Data Storage
    store: {
        get: (key) => store.get(key),
        set: (key, value) => store.set(key, value),
        delete: (key) => store.delete(key),
        clear: () => store.clear()
    }
});