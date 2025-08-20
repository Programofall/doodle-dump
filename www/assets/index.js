
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
  