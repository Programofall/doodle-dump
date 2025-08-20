// Medical Manager Renderer Script
import { ZoomMtg } from '@zoom/meetingsdk';
import * as uuid from 'uuid';

console.log('Medical Manager Renderer loaded');

// Initialize Zoom Meeting SDK
ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired!');

    // --- Get references to all our HTML elements ---
    const startMeetingBtn = document.getElementById('start-meeting-btn');
    const endMeetingBtn = document.getElementById('end-meeting-btn');
    const patientNameInput = document.getElementById('patient-name');
    const dobInput = document.getElementById('dob');
    const medicalIdInput = document.getElementById('medical-id');
    const appointmentDateInput = document.getElementById('appointment-date');
    const appointmentTypeSelect = document.getElementById('appointment-type');
    const scheduleBtn = document.getElementById('schedule-btn');
    const medicalHistoryInput = document.getElementById('medical-history');
    const medicationsInput = document.getElementById('medications');
    const saveRecordsBtn = document.getElementById('save-records-btn');
    const aiInput = document.getElementById('ai-input');
    const aiSubmitBtn = document.getElementById('ai-submit-btn');
    const statusMessageEl = document.getElementById('status-message');

    // --- Zoom Meeting Functions ---
    const initializeZoomMeeting = async () => {
        try {
            const meetingNumber = await window.electronAPI.getZoomMeeting();
            const zoomConfig = {
                meetingNumber: meetingNumber,
                leaveUrl: window.location.origin,
                userName: patientNameInput.value || 'Patient',
                userEmail: '', // Optional
                passWord: '', // If required
                role: 1, // 1 for host with SDK key
                success: (success) => {
                    console.log('Meeting started successfully:', success);
                },
                error: (error) => {
                    console.error('Failed to start meeting:', error);
    // Save Appointment to file in Downloads
    const saveAppointmentBtn = document.getElementById('save-appointment-btn');
    const contactList = document.getElementById('contact-list');
    if (saveAppointmentBtn) {
      saveAppointmentBtn.addEventListener('click', async () => {
        // Gather appointment data
        const appointment = {
          id: uuid.v4(),
          date: appointmentDateInput.value,
          type: appointmentTypeSelect.value,
          provider: document.getElementById('appointment-provider').value,
          copay: document.getElementById('appointment-copay').value,
          bill: document.getElementById('appointment-bill').value,
          outOfPocket: document.getElementById('appointment-out-of-pocket').value,
          notes: document.getElementById('appointment-notes').value,
          contact: contactList ? contactList.value : ''
        };
        try {
          // Save to file in Downloads (Electron API required)
          if (window.electronAPI && window.electronAPI.saveAppointmentToDownloads) {
            await window.electronAPI.saveAppointmentToDownloads(appointment);
            statusMessageEl.textContent = 'Appointment saved to Downloads';
          } else {
            // Fallback: download as JSON in browser
            const jsonString = JSON.stringify(appointment, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `appointment_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            statusMessageEl.textContent = 'Appointment downloaded';
          }
          setTimeout(() => statusMessageEl.textContent = '', 3000);
        } catch (error) {
          console.error('Failed to save appointment:', error);
          statusMessageEl.textContent = 'Failed to save appointment';
        }
      });
    }
                }
            };

            // Additional SDK controls configuration
            const sdkSettings = {
                disablePreview: false, // Enable preview before joining
                disableJoinAudio: false, // Enable audio joining
                disableVideo: false, // Enable video
                disableInvite: false, // Allow inviting others
                disableCORP: true, // Disable CORP for better compatibility
                disableRecord: false, // Allow recording if host
                isSupportChat: true, // Enable chat
                isSupportQA: true, // Enable Q&A
                isSupportCC: true, // Enable closed captions
                isSupportPolling: true, // Enable polling
                isSupportBreakout: true, // Enable breakout rooms
                screenShare: true, // Enable screen sharing
                videoDrag: true, // Enable video window dragging
                sharingMode: 'Desktop', // Desktop sharing mode
                videoQuality: 'Auto', // Auto adjust video quality
                meetingInfo: [ // Show meeting info
                    'topic',
                    'host',
                    'mn',
                    'pwd',
                    'telPwd',
                    'invite',
                    'participant',
                    'dc',
                    'enctype',
                ],
                disableVoIP: false, // Enable VoIP
                disableReport: false, // Enable reporting
                isLockBottom: false // Allow bottom toolbar movement
            };

            ZoomMtg.init({
                leaveUrl: zoomConfig.leaveUrl,
                ...sdkSettings,
                success: (success) => {
                    console.log('Zoom initialized:', success);
                    
                    // Set up meeting controls
                    ZoomMtg.inMeetingServiceListener('onUserJoin', (data) => {
                        console.log('User joined:', data);
                    });

                    ZoomMtg.inMeetingServiceListener('onUserLeave', (data) => {
                        console.log('User left:', data);
                    });

                    ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', (data) => {
                        console.log('User in waiting room:', data);
                    });

                    ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data) => {
                        console.log('Meeting status:', data);
                    });

                    // Join the meeting with enhanced controls
                    ZoomMtg.join({
                        ...zoomConfig,
                        success: (joinResponse) => {
                            console.log('Joined meeting:', joinResponse);
                            
                            // Enable additional controls after joining
                            ZoomMtg.getAttendeesList({});
                            ZoomMtg.getCurrentUser({});
                            
                            // Set up meeting control buttons
                            setupMeetingControls();
                            console.log('Joined meeting:', joinResponse);
                            statusMessageEl.textContent = 'Connected to video conference';
                        },
                        error: (error) => {
                            console.error('Failed to join meeting:', error);
                            statusMessageEl.textContent = 'Failed to join video conference';
                        }
                    });
                },
                error: (error) => {
                    console.error('Failed to initialize Zoom:', error);
                    statusMessageEl.textContent = 'Failed to initialize video conference';
                }
            });
        } catch (error) {
            console.error('Failed to setup meeting:', error);
            statusMessageEl.textContent = 'Failed to setup video conference';
        }
    };

    // --- Medical Records Functions ---
    const saveMedicalRecords = async () => {
        // Gather all the medical record data
        const records = {
            patientInfo: {
                name: patientNameInput.value,
                dob: dobInput.value,
                medicalId: medicalIdInput.value
            },
            appointments: {
                date: appointmentDateInput.value,
                type: appointmentTypeSelect.value,
                provider: document.getElementById('appointment-provider').value,
                notes: document.getElementById('appointment-notes').value,
                financials: {
                    copay: document.getElementById('appointment-copay').value,
                    bill: document.getElementById('appointment-bill').value,
                    outOfPocket: document.getElementById('appointment-out-of-pocket').value
                }
            },
            medicalHistory: medicalHistoryInput.value,
            medications: medicationsInput.value,
            lastUpdated: new Date().toISOString()
        };

        try {
            // Create a Blob with the JSON data
            const jsonString = JSON.stringify(records, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create the download link
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `medical_records_${new Date().toISOString().split('T')[0]}.json`;
            
            // Trigger the download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Also save to the app's storage
            await window.electronAPI.saveMedicalRecords(records);
            
            statusMessageEl.textContent = 'Medical records saved and downloaded successfully';
            setTimeout(() => statusMessageEl.textContent = '', 3000);
        } catch (error) {
            console.error('Failed to save medical records:', error);
            statusMessageEl.textContent = 'Failed to save medical records';
        }
    };

    const scheduleAppointment = async () => {
        const appointment = {
            id: uuid.v4(),
            date: appointmentDateInput.value,
            type: appointmentTypeSelect.value,
            patientName: patientNameInput.value,
            medicalId: medicalIdInput.value,
            status: 'scheduled'
        };

        try {
            await window.electronAPI.scheduleAppointment(appointment);
            statusMessageEl.textContent = 'Appointment scheduled successfully';
            setTimeout(() => statusMessageEl.textContent = '', 3000);
            appointmentDateInput.value = '';
            appointmentTypeSelect.value = '';
        } catch (error) {
            console.error('Failed to schedule appointment:', error);
            statusMessageEl.textContent = 'Failed to schedule appointment';
        }
    };

    // --- Medical Search Function ---
    const handleAiQuery = async () => {
        const query = aiInput.value.trim();
        if (!query) return;

        try {
            aiSubmitBtn.disabled = true;
            aiSubmitBtn.classList.add('loading');
            statusMessageEl.textContent = 'Searching medical database...';
            
            const response = await window.electronAPI.askMedicalAssistant(query);
            aiInput.value = '';
            
            // Create or update medical search response dialog
            showAiResponseDialog(query, response);
            
            statusMessageEl.textContent = 'Search results found';
            aiSubmitBtn.classList.remove('loading');
            aiSubmitBtn.classList.add('success');
            setTimeout(() => {
                aiSubmitBtn.classList.remove('success');
            }, 2000);
            
        } catch (error) {
            console.error('AI Assistant error:', error);
            statusMessageEl.textContent = 'Failed to get AI response';
            aiSubmitBtn.classList.remove('loading');
        } finally {
            aiSubmitBtn.disabled = false;
        }
    };
    
    // Function to show medical search response in a dialog
    function showAiResponseDialog(query, response) {
        // Check if dialog exists, create if not
        let aiDialog = document.getElementById('ai-response-dialog');
        
        if (!aiDialog) {
            aiDialog = document.createElement('div');
            aiDialog.id = 'ai-response-dialog';
            aiDialog.style.cssText = `
                position: fixed;
                top: 60px;
                right: 20px;
                width: 400px;
                max-height: 500px;
                background: #f5f5f5;
                border: 1px solid #d4b5a9;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            `;
            
            document.body.appendChild(aiDialog);
        }
        
        // Update dialog content
        aiDialog.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #5d4037;">Medical Information</h4>
                <button id="close-ai-dialog" style="background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div style="font-weight: bold; margin-bottom: 8px; color: #5d4037;">Your search:</div>
            <div style="padding: 8px; background: #e8d6d0; border-radius: 4px; margin-bottom: 12px;">${query}</div>
            <div style="font-weight: bold; margin-bottom: 8px; color: #5d4037;">Results:</div>
            <div style="padding: 8px; background: #fff; border-radius: 4px; white-space: pre-wrap;">${response}</div>
        `;
        
        // Add close button functionality
        document.getElementById('close-ai-dialog').addEventListener('click', () => {
            aiDialog.style.display = 'none';
        });
        
        // Show the dialog
        aiDialog.style.display = 'flex';
    }

    // Set up meeting controls
    const setupMeetingControls = () => {
        // Audio controls
        const muteButton = document.createElement('button');
        muteButton.className = 'btn';
        muteButton.innerHTML = '🎤 Mute';
        muteButton.onclick = () => ZoomMtg.mute({ mute: true });

        const unmuteButton = document.createElement('button');
        unmuteButton.className = 'btn';
        unmuteButton.innerHTML = '🎤 Unmute';
        unmuteButton.onclick = () => ZoomMtg.mute({ mute: false });

        // Video controls
        const startVideoButton = document.createElement('button');
        startVideoButton.className = 'btn';
        startVideoButton.innerHTML = '📹 Start Video';
        startVideoButton.onclick = () => ZoomMtg.startVideo({});

        const stopVideoButton = document.createElement('button');
        stopVideoButton.className = 'btn';
        stopVideoButton.innerHTML = '📹 Stop Video';
        stopVideoButton.onclick = () => ZoomMtg.stopVideo({});

        // Screen sharing
        const shareButton = document.createElement('button');
        shareButton.className = 'btn';
        shareButton.innerHTML = '🖥️ Share Screen';
        shareButton.onclick = () => ZoomMtg.shareScreen({});

        // Recording control
        const recordButton = document.createElement('button');
        recordButton.className = 'btn';
        recordButton.innerHTML = '⏺️ Record';
        recordButton.onclick = () => ZoomMtg.startRecord({});

        // Security controls
        const securityButton = document.createElement('button');
        securityButton.className = 'btn';
        securityButton.innerHTML = '🔒 Security';
        securityButton.onclick = () => {
            ZoomMtg.getCurrentUser({
                success: (res) => {
                    if (res.result.isHost) {
                        ZoomMtg.lockMeeting({
                            lock: true
                        });
                    }
                }
            });
        };

        // Add controls to the meeting container
        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'absolute';
        controlsContainer.style.bottom = '20px';
        controlsContainer.style.left = '50%';
        controlsContainer.style.transform = 'translateX(-50%)';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.zIndex = '1000';
        
        controlsContainer.appendChild(muteButton);
        controlsContainer.appendChild(unmuteButton);
        controlsContainer.appendChild(startVideoButton);
        controlsContainer.appendChild(stopVideoButton);
        controlsContainer.appendChild(shareButton);
        controlsContainer.appendChild(recordButton);
        controlsContainer.appendChild(securityButton);

        const meetingContainer = document.getElementById('zoom-meeting-container');
        if (meetingContainer) {
            meetingContainer.appendChild(controlsContainer);
        }
    };

    // --- Event Listeners ---
    startMeetingBtn.addEventListener('click', initializeZoomMeeting);
    endMeetingBtn.addEventListener('click', () => {
        ZoomMtg.leaveMeeting({});
        statusMessageEl.textContent = 'Left video conference';
    });

    saveRecordsBtn.addEventListener('click', saveMedicalRecords);
    scheduleBtn.addEventListener('click', scheduleAppointment);
    aiSubmitBtn.addEventListener('click', handleAiQuery);

    // Handle Enter key in AI input
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAiQuery();
        }
    });
  const captureBtn = document.getElementById('capture-btn');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveKeyBtn = document.getElementById('save-key-btn');
  const solutionInput = document.getElementById('solution-input');
  const solveBtn = document.getElementById('solve-btn');
  const puzzleStatus = document.getElementById('puzzle-status');
  const walletAddressInput = document.getElementById('wallet-address-input');
  const statusMessage = document.getElementById('status-message');


  console.log('Element references:', {
    editorContainer: !!editorContainer,
    urlInput: !!urlInput,
    loadBtn: !!loadBtn,
    captureBtn: !!captureBtn,
    apiKeyInput: !!apiKeyInput,
    saveKeyBtn: !!saveKeyBtn,
    solutionInput: !!solutionInput,
    solveBtn: !!solveBtn,
    walletAddressInput: !!walletAddressInput,
    statusMessage: !!statusMessage
  });

  console.log('electronAPI available:', !!window.electronAPI);
  if (window.electronAPI) {
    console.log('electronAPI methods:', Object.keys(window.electronAPI));
  }

  // --- Initialize the Monaco Editor (only if its container exists) ---
  if (editorContainer) {
    console.log('Creating Monaco Editor...');
    try {
      const editor = monaco.editor.create(editorContainer, {
          value: `// 1. Enter and save your Gemini API Key.\n// 2. Paste a YouTube URL and click "Load Video".\n// 3. Double click video for pause/controls.\n// 4 Search for The Puzzle Code in Learn Solidity Paste/WIN `,
          language: 'javascript',
          theme: 'vs-dark'
      });

      console.log('Monaco Editor created successfully');

      window.addEventListener('resize', () => {
          editor.layout();
      });

      // Listen for code coming back from the main process
      if (window.electronAPI && window.electronAPI.onCodeExtracted) {
        window.electronAPI.onCodeExtracted((code) => {
            console.log('Received code in renderer:', code);
            if (editor) {
                editor.setValue(code);
            }
        });
      }
    } catch (error) {
      console.error('Error creating Monaco Editor:', error);
      // Fallback: create a simple textarea
      editorContainer.innerHTML = '<textarea style="width: 100%; height: 100%; background: #1e1e1e; color: white; border: none; font-family: monospace;" placeholder="Code will appear here..."></textarea>';
    }
  } else {
    console.error('Fatal Error: Could not find the editor container element.');
  }

  // --- Set up ALL Event Listeners (with safety checks) ---

  // Safety check for the "Load Video" button
  if (loadBtn && urlInput) {
    console.log('Setting up Load Video button listener...');
    loadBtn.addEventListener('click', () => {
        console.log('Load Video button clicked!');
        const url = urlInput.value;
        console.log('URL value:', url);
        if (url) {
            // This is the single, correct block of code
            console.log(`Renderer: Sending URL to main process --> ${url}`);
            window.electronAPI.loadYouTubeURL(url);
        } else {
            console.log('No URL entered');
        }
    });
  } else {
    console.error('Could not find the "Load Video" button or URL input.');
  }

  // Safety check for the "Capture Frame" button
  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        window.electronAPI.captureFrame();
    });
  } else {
    console.error('Could not find the "Capture Frame" button.');
  }
  // Safety check and event listener for the "Solve Puzzle" button
  if (solveBtn && solutionInput && walletAddressInput && puzzleStatus) {
    solveBtn.addEventListener('click', () => {
        const solution = solutionInput.value;
        const walletAddress = walletAddressInput.value;
        if (solution && walletAddress) {
            console.log(`Renderer: Sending solution to main process --> ${solution}`);
            // Clear previous status and show a "working" message
            puzzleStatus.textContent = "Submitting solution to the blockchain...";
            window.electronAPI.solvePuzzle(solution, walletAddress);
        } else {
            if (!solution) {
                puzzleStatus.textContent = 'Please enter a solution phrase.';
            } else if (!walletAddress) {
                puzzleStatus.textContent = 'Please enter your ETH wallet address.';
            }
        }
    });
  } else {
    console.error('Could not find the puzzle input or solve button.');
  }

  // Add a new listener to get the result back from the main process
  window.electronAPI.onPuzzleResult((result) => {
    console.log(`Renderer: Received puzzle result --> ${result.message}`);
    puzzleStatus.textContent = result.message; // Display the success/error message
  });

    // API Key Management
    const apiTypeSelect = document.getElementById('api-type');
    if (saveKeyBtn && apiKeyInput && apiTypeSelect && statusMessageEl) {
        console.log('Setting up API Key management...');
        
        // Update placeholder based on selected API type
        apiTypeSelect.addEventListener('change', () => {
            const selectedApi = apiTypeSelect.value;
            switch(selectedApi) {
                case 'zoom':
                    apiKeyInput.placeholder = 'Enter Zoom API Key...';
                    break;
                case 'gemini':
                    apiKeyInput.placeholder = 'Enter Google Gemini API Key...';
                    break;
                case 'claude':
                    apiKeyInput.placeholder = 'Enter Claude API Key...';
                    break;
                default:
                    apiKeyInput.placeholder = 'Select an API type first...';
            }
        });
        
        saveKeyBtn.addEventListener('click', () => {
            const apiType = apiTypeSelect.value;
            const apiKey = apiKeyInput.value;
            console.log('Save Key button clicked. API Type:', apiType);
            
            if (!apiType) {
                statusMessageEl.textContent = 'Please select an API type.';
                setTimeout(() => statusMessageEl.textContent = '', 3000);
                return;
            }
            
            if (!apiKey || apiKey.trim() === '') {
                statusMessageEl.textContent = 'Please enter an API key.';
                setTimeout(() => statusMessageEl.textContent = '', 3000);
                return;
            }
            
            console.log('Sending API key to main process...');
            window.electronAPI.setApiKey(apiType, apiKey.trim());
            
            // Clear the input field immediately
            apiKeyInput.value = '';
            
            // Show loading state
            saveKeyBtn.disabled = true;
            statusMessageEl.textContent = `Verifying ${apiType.toUpperCase()} API Key...`;
        });    // Listen for API key status updates
    if (window.electronAPI && window.electronAPI.onApiKeyStatus) {
      window.electronAPI.onApiKeyStatus((status) => {
        console.log('Received API key status:', status);
        
        // Reset button state and text
        if (saveKeyBtn.querySelector('span')) saveKeyBtn.querySelector('span').textContent = 'Save Key';
        saveKeyBtn.disabled = false;
        
        // Use the status message element instead of an alert
        statusMessage.textContent = status.message;
        setTimeout(() => statusMessage.textContent = '', 5000); // Clear message after 5s

        if (status.success) {
          console.log('API key saved successfully');
        } else {
          console.error('API key save failed:', status.message);
        }
      });
    }
  } else {
    console.error('Could not find the API Key input or save button.');
  }

  // --- Context Menu Setup for Input Fields ---
  let currentInputElement = null;

  // Add right-click context menu to URL input
  if (urlInput) {
    urlInput.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      currentInputElement = urlInput;
      console.log('Right-click on URL input');
      window.electronAPI.showContextMenu('url-input');
    });
  }

  // Add right-click context menu to API key input
  if (apiKeyInput) {
    apiKeyInput.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      currentInputElement = apiKeyInput;
      console.log('Right-click on API key input');
      window.electronAPI.showContextMenu('api-key-input');
    });
  }

  // Listen for context menu commands
  if (window.electronAPI && window.electronAPI.onContextMenuCommand) {
    window.electronAPI.onContextMenuCommand((command) => {
      console.log('Context menu command:', command);
      
      if (!currentInputElement) {
        console.error('No input element selected for context menu command');
        return;
      }

      switch (command) {
        case 'cut':
          if (currentInputElement.selectionStart !== currentInputElement.selectionEnd) {
            const selectedText = currentInputElement.value.substring(
              currentInputElement.selectionStart, 
              currentInputElement.selectionEnd
            );
            navigator.clipboard.writeText(selectedText);
            
            // Remove selected text
            const start = currentInputElement.selectionStart;
            const end = currentInputElement.selectionEnd;
            currentInputElement.value = currentInputElement.value.substring(0, start) + 
                                      currentInputElement.value.substring(end);
            currentInputElement.setSelectionRange(start, start);
            console.log('Cut operation completed');
          }
          break;
          
        case 'copy':
          if (currentInputElement.selectionStart !== currentInputElement.selectionEnd) {
            const selectedText = currentInputElement.value.substring(
              currentInputElement.selectionStart, 
              currentInputElement.selectionEnd
            );
            navigator.clipboard.writeText(selectedText);
            console.log('Copy operation completed');
          }
          break;
          
        case 'paste':
          navigator.clipboard.readText().then((text) => {
            const start = currentInputElement.selectionStart;
            const end = currentInputElement.selectionEnd;
            const currentValue = currentInputElement.value;
            
            // Insert pasted text at cursor position
            currentInputElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
            
            // Set cursor position after pasted text
            const newPosition = start + text.length;
            currentInputElement.setSelectionRange(newPosition, newPosition);
            
            // Focus the input
            currentInputElement.focus();
            console.log('Paste operation completed');
          }).catch((err) => {
            console.error('Failed to read clipboard:', err);
          });
          break;
          
        case 'selectAll':
          currentInputElement.select();
          console.log('Select all operation completed');
          break;
          
        default:
          console.log('Unknown context menu command:', command);
      }
    });
  }

});
