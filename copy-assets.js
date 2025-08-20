const fs = require('fs');
const path = require('path');

// Ensure the dist folder exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Ensure the dist/src folder exists
if (!fs.existsSync('./dist/src')) {
  fs.mkdirSync('./dist/src', { recursive: true });
}

// Copy the index.html file to the output directory
try {
  console.log('Copying index.html to root and dist directory...');
  
  // Read the original index.html
  const indexHtml = fs.readFileSync('./index.html', 'utf8');
  
  // Copy to dist folder
  fs.writeFileSync('./dist/index.html', indexHtml);
  
  // Copy renderer.js to dist folder
  console.log('Copying renderer.js to dist/src directory...');
  const rendererJs = fs.readFileSync('./src/renderer.js', 'utf8');
  fs.writeFileSync('./dist/src/renderer.js', rendererJs);
  
  // Copy preload.js to dist folder
  console.log('Copying preload.js to dist/src directory...');
  const preloadJs = fs.readFileSync('./src/preload.js', 'utf8');
  fs.writeFileSync('./dist/src/preload.js', preloadJs);
  
  // Create a simple bundled version
  console.log('Creating bundled script...');
  const bundledContent = `
    // Medical Manager Bundled Script for Production
    console.log('Medical Manager bundled script loaded');
    
    // Initialize app
    window.addEventListener('DOMContentLoaded', () => {
      // Create app container if it doesn't exist
      if (!document.getElementById('app-container')) {
        const appContainer = document.createElement('div');
        appContainer.id = 'app-container';
        document.body.appendChild(appContainer);
        
        // Create medical form container
        const formContainer = document.createElement('div');
        formContainer.id = 'medical-form-container';
        formContainer.innerHTML = '<h1>Medical Manager</h1><p>Application loaded successfully!</p>';
        appContainer.appendChild(formContainer);
        
        console.log('Created app container structure');
      }

      // Try to load the full renderer script
      const script = document.createElement('script');
      script.src = './src/renderer.js';
      script.type = 'text/javascript';
      document.head.appendChild(script);
    });
  `;
  
  // Create assets directory if it doesn't exist
  if (!fs.existsSync('./dist/assets')) {
    fs.mkdirSync('./dist/assets', { recursive: true });
  }
  
  fs.writeFileSync('./dist/assets/index.js', bundledContent);
  
  console.log('Assets copied successfully!');
} catch (err) {
  console.error('Error copying assets:', err);
  process.exit(1);
}
