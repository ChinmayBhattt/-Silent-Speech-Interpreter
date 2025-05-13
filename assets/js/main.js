// DOM Elements
const landingSection = document.getElementById('landing');
const interpreterSection = document.getElementById('interpreter');
const tutorialSection = document.getElementById('tutorial-section');

// Buttons
const startBtn = document.getElementById('start-btn');
const tutorialBtn = document.getElementById('tutorial-btn');
const helpBtn = document.getElementById('help-btn');
const backToLandingBtn = document.getElementById('back-to-landing');
const tutorialBackBtn = document.getElementById('tutorial-back');
const toggleVideoBtn = document.getElementById('toggle-video');
const toggleAudioBtn = document.getElementById('toggle-audio');
const settingsBtn = document.getElementById('settings');
const copyTextBtn = document.getElementById('copy-text');
const clearTextBtn = document.getElementById('clear-text');
const playSpeechBtn = document.getElementById('play-speech');

// Video Elements
const videoFeed = document.getElementById('video-feed');
const lipTrackingOverlay = document.getElementById('lip-tracking-overlay');
const transcriptionBox = document.getElementById('transcription-box');
const volumeSlider = document.getElementById('volume-slider');

// Modal Elements
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.querySelector('.close-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const resetSettingsBtn = document.getElementById('reset-settings');

// Confidence Levels
const lipsConfidence = document.getElementById('lips-confidence');
const faceConfidence = document.getElementById('face-confidence');
const contextConfidence = document.getElementById('context-confidence');

// Application State
let isVideoActive = false;
let isAudioEnabled = true;
let isRecording = false;
let stream = null;
let currentTheme = 'light';
let speechSynthesis = window.speechSynthesis;
let demoMode = true; // Set to true for demo without actual AI processing

// Initialize the application
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    attachEventListeners();
    checkBrowserCompatibility();
    applyTheme(currentTheme);
}

// Attach all event listeners
function attachEventListeners() {
    // Navigation buttons
    startBtn.addEventListener('click', showInterpreter);
    tutorialBtn.addEventListener('click', () => window.location.href = 'tutorial.html');
    helpBtn.addEventListener('click', () => window.location.href = 'help.html');
    backToLandingBtn.addEventListener('click', showLanding);
    tutorialBackBtn.addEventListener('click', showLanding);
    
    // Video controls
    toggleVideoBtn.addEventListener('click', toggleVideo);
    toggleAudioBtn.addEventListener('click', toggleAudio);
    settingsBtn.addEventListener('click', showSettings);
    
    // Output controls
    copyTextBtn.addEventListener('click', copyTranscription);
    clearTextBtn.addEventListener('click', clearTranscription);
    playSpeechBtn.addEventListener('click', playTranscription);
    volumeSlider.addEventListener('input', updateVolume);
    
    // Modal controls
    closeModalBtn.addEventListener('click', hideSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    
    // Theme selector
    document.getElementById('theme-select').addEventListener('change', function(e) {
        applyTheme(e.target.value);
    });
    
    // Speech rate
    document.getElementById('speech-rate').addEventListener('input', function(e) {
        document.getElementById('speech-rate-value').textContent = `${e.target.value}x`;
    });
}

// Check if browser supports required features
function checkBrowserCompatibility() {
    let warningMessage = '';
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        warningMessage += 'Your browser does not support camera access. ';
    }
    
    if (!window.speechSynthesis) {
        warningMessage += 'Your browser does not support speech synthesis. ';
    }
    
    if (warningMessage) {
        showCompatibilityWarning(warningMessage);
    }
}

function showCompatibilityWarning(message) {
    const warning = document.createElement('div');
    warning.className = 'compatibility-warning';
    warning.innerHTML = `
        <div class="warning-content">
            <h3><i class="fas fa-exclamation-triangle"></i> Compatibility Warning</h3>
            <p>${message}</p>
            <p>Please use a modern browser like Chrome, Firefox, or Edge.</p>
            <button id="dismiss-warning" class="secondary-btn">Dismiss</button>
        </div>
    `;
    
    document.body.appendChild(warning);
    document.getElementById('dismiss-warning').addEventListener('click', function() {
        warning.remove();
    });
}

// Navigation functions
function showLanding() {
    landingSection.classList.add('active-section');
    landingSection.classList.remove('hidden-section');
    
    interpreterSection.classList.add('hidden-section');
    interpreterSection.classList.remove('active-section');
    
    tutorialSection.classList.add('hidden-section');
    tutorialSection.classList.remove('active-section');
    
    stopVideo();
}

function showInterpreter() {
    interpreterSection.classList.add('active-section');
    interpreterSection.classList.remove('hidden-section');
    
    landingSection.classList.add('hidden-section');
    landingSection.classList.remove('active-section');
    
    tutorialSection.classList.add('hidden-section');
    tutorialSection.classList.remove('active-section');
    
    startVideo();
}

// Leaving this function for compatibility but it's no longer used directly from button clicks
function showTutorial() {
    tutorialSection.classList.add('active-section');
    tutorialSection.classList.remove('hidden-section');
    
    landingSection.classList.add('hidden-section');
    landingSection.classList.remove('active-section');
    
    interpreterSection.classList.add('hidden-section');
    interpreterSection.classList.remove('active-section');
}

// Video handling
async function startVideo() {
    if (isVideoActive) return;
    
    try {
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoFeed.srcObject = stream;
        isVideoActive = true;
        toggleVideoBtn.innerHTML = '<i class="fas fa-video"></i>';
        
        // Start demo processing if in demo mode
        if (demoMode) {
            startDemoProcessing();
        }
    } catch (err) {
        console.error('Error accessing camera:', err);
        showErrorMessage('Could not access camera. Please check permissions.');
    }
}

function stopVideo() {
    if (!isVideoActive) return;
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    videoFeed.srcObject = null;
    isVideoActive = false;
    toggleVideoBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
    
    // Stop demo processing
    if (demoMode) {
        stopDemoProcessing();
    }
}

function toggleVideo() {
    if (isVideoActive) {
        stopVideo();
    } else {
        startVideo();
    }
}

function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    
    if (isAudioEnabled) {
        toggleAudioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        toggleAudioBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        speechSynthesis.cancel();
    }
}

// Settings modal
function showSettings() {
    settingsModal.style.display = 'flex';
    populateCameraOptions();
}

function hideSettings() {
    settingsModal.style.display = 'none';
}

async function populateCameraOptions() {
    const cameraSelect = document.getElementById('camera-select');
    
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Clear existing options
        cameraSelect.innerHTML = '';
        
        if (videoDevices.length === 0) {
            const option = document.createElement('option');
            option.value = 'default';
            option.textContent = 'No cameras found';
            cameraSelect.appendChild(option);
            return;
        }
        
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error getting camera devices:', err);
    }
}

function saveSettings() {
    // Update theme
    currentTheme = document.getElementById('theme-select').value;
    applyTheme(currentTheme);
    
    // Switch camera if needed
    const selectedCamera = document.getElementById('camera-select').value;
    if (selectedCamera !== 'default' && isVideoActive) {
        switchCamera(selectedCamera);
    }
    
    hideSettings();
}

function resetSettings() {
    document.getElementById('theme-select').value = 'light';
    document.getElementById('camera-select').value = 'default';
    document.getElementById('resolution-select').value = '720p';
    document.getElementById('voice-select').value = 'female';
    document.getElementById('speech-rate').value = '1';
    document.getElementById('speech-rate-value').textContent = '1.0x';
    document.getElementById('auto-clear').checked = true;
    
    applyTheme('light');
}

async function switchCamera(deviceId) {
    // Stop current stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    try {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoFeed.srcObject = stream;
    } catch (err) {
        console.error('Error switching camera:', err);
        showErrorMessage('Could not switch camera.');
    }
}

// Apply theme
function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'high-contrast-theme');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'high-contrast') {
        document.body.classList.add('high-contrast-theme');
    }
    
    currentTheme = theme;
}

// Transcription functions
function copyTranscription() {
    const text = extractTextFromTranscription();
    
    if (!text) {
        showNotification('No text to copy', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('Text copied to clipboard', 'success');
        })
        .catch(err => {
            console.error('Could not copy text:', err);
            showNotification('Failed to copy text', 'error');
        });
}

function clearTranscription() {
    transcriptionBox.innerHTML = '<p class="placeholder">Your interpreted speech will appear here...</p>';
}

function extractTextFromTranscription() {
    // Remove placeholder if it exists
    const placeholder = transcriptionBox.querySelector('.placeholder');
    if (placeholder && placeholder.parentNode === transcriptionBox) {
        return '';
    }
    
    return transcriptionBox.textContent.trim();
}

function updateVolume() {
    const volume = volumeSlider.value / 100;
    // Will be used when playing speech
}

function playTranscription() {
    if (!isAudioEnabled) {
        showNotification('Audio is muted', 'warning');
        return;
    }
    
    const text = extractTextFromTranscription();
    
    if (!text) {
        showNotification('No text to speak', 'warning');
        return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on selection
    const voiceType = document.getElementById('voice-select').value;
    const voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
        // Try to find a matching voice
        let voice;
        
        if (voiceType === 'female') {
            voice = voices.find(v => v.name.includes('female') || v.name.includes('woman'));
        } else if (voiceType === 'male') {
            voice = voices.find(v => v.name.includes('male') || v.name.includes('man'));
        }
        
        // Default to first voice if no match
        utterance.voice = voice || voices[0];
    }
    
    // Set speech rate
    utterance.rate = parseFloat(document.getElementById('speech-rate').value);
    
    // Set volume
    utterance.volume = volumeSlider.value / 100;
    
    // Speak the text
    speechSynthesis.speak(utterance);
}

// Notification/alert functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Automatically remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'error':
            return 'fa-times-circle';
        default:
            return 'fa-info-circle';
    }
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

// Demo mode functions for UI demonstration
let demoInterval;
const demoWords = [
    'Hello',
    'How are you today?',
    'My name is',
    'Thank you for your help',
    'Can you please tell me',
    'I would like to',
    'This is amazing technology',
    'It is nice to meet you',
    'I am feeling great today',
    'The weather is beautiful'
];

function startDemoProcessing() {
    // Clear any existing text
    clearTranscription();
    
    // Show processing indicators
    document.querySelector('.processing-indicator').style.display = 'flex';
    
    // Start with a delay to simulate processing
    setTimeout(() => {
        // Create overlay elements to simulate lip tracking
        createLipTrackingElements();
        
        // Gradual confidence increase
        animateConfidenceLevels();
        
        // Start adding words with random intervals
        let wordIndex = 0;
        const addWord = () => {
            if (wordIndex < demoWords.length && isVideoActive) {
                addTranscribedWord(demoWords[wordIndex]);
                wordIndex++;
                
                // Random delay between words
                const delay = 500 + Math.random() * 2000;
                demoInterval = setTimeout(addWord, delay);
            }
        };
        
        // Start adding words after initial delay
        demoInterval = setTimeout(addWord, 2000);
    }, 3000);
}

function stopDemoProcessing() {
    // Clear intervals
    clearTimeout(demoInterval);
    
    // Hide processing indicators
    document.querySelector('.processing-indicator').style.display = 'none';
    
    // Clear lip tracking elements
    lipTrackingOverlay.innerHTML = '';
}

function createLipTrackingElements() {
    lipTrackingOverlay.innerHTML = '';
    
    // Create box around mouth area to simulate tracking
    const mouthBox = document.createElement('div');
    mouthBox.className = 'mouth-tracking-box';
    mouthBox.style.position = 'absolute';
    mouthBox.style.width = '60px';
    mouthBox.style.height = '30px';
    mouthBox.style.border = '2px solid rgba(142, 84, 233, 0.7)';
    mouthBox.style.borderRadius = '10px';
    mouthBox.style.left = 'calc(50% - 30px)';
    mouthBox.style.top = 'calc(50% + 20px)';
    mouthBox.style.backgroundColor = 'rgba(142, 84, 233, 0.1)';
    
    // Tracking points
    for (let i = 0; i < 8; i++) {
        const point = document.createElement('div');
        point.className = 'tracking-point';
        point.style.position = 'absolute';
        point.style.width = '4px';
        point.style.height = '4px';
        point.style.backgroundColor = 'rgba(142, 84, 233, 0.9)';
        point.style.borderRadius = '50%';
        
        // Position randomly within the mouth area
        const offsetX = -30 + i * 8 + Math.random() * 4;
        const offsetY = Math.random() * 20 - 10;
        
        point.style.left = `calc(50% + ${offsetX}px)`;
        point.style.top = `calc(50% + ${20 + offsetY}px)`;
        
        lipTrackingOverlay.appendChild(point);
    }
    
    lipTrackingOverlay.appendChild(mouthBox);
}

function animateConfidenceLevels() {
    // Start with lower confidence
    updateConfidenceLevel(lipsConfidence, 30);
    updateConfidenceLevel(faceConfidence, 20);
    updateConfidenceLevel(contextConfidence, 10);
    
    // Gradually increase confidence levels
    setTimeout(() => updateConfidenceLevel(lipsConfidence, 50), 1000);
    setTimeout(() => updateConfidenceLevel(faceConfidence, 40), 1500);
    setTimeout(() => updateConfidenceLevel(contextConfidence, 30), 2000);
    
    setTimeout(() => updateConfidenceLevel(lipsConfidence, 70), 3000);
    setTimeout(() => updateConfidenceLevel(faceConfidence, 60), 3500);
    setTimeout(() => updateConfidenceLevel(contextConfidence, 50), 4000);
    
    setTimeout(() => updateConfidenceLevel(lipsConfidence, 80), 5000);
    setTimeout(() => updateConfidenceLevel(faceConfidence, 65), 5500);
    setTimeout(() => updateConfidenceLevel(contextConfidence, 70), 6000);
}

function updateConfidenceLevel(element, percentage) {
    if (element) {
        element.style.width = `${percentage}%`;
    }
}

function addTranscribedWord(word) {
    // Remove placeholder if it exists
    const placeholder = transcriptionBox.querySelector('.placeholder');
    if (placeholder && placeholder.parentNode === transcriptionBox) {
        transcriptionBox.innerHTML = '';
    }
    
    // Add the word
    if (transcriptionBox.innerHTML === '') {
        transcriptionBox.innerHTML = word;
    } else {
        transcriptionBox.innerHTML += ' ' + word;
    }
    
    // Auto-scroll to bottom
    transcriptionBox.scrollTop = transcriptionBox.scrollHeight;
}

// Add custom CSS for notifications
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s ease;
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}

.notification.success {
    border-left: 4px solid var(--success-color);
}

.notification.warning {
    border-left: 4px solid var(--warning-color);
}

.notification.error {
    border-left: 4px solid var(--error-color);
}

.notification.info {
    border-left: 4px solid var(--primary-color);
}

.notification-content {
    display: flex;
    align-items: center;
}

.notification-content i {
    margin-right: 10px;
    font-size: 1.2rem;
}

.notification.success i {
    color: var(--success-color);
}

.notification.warning i {
    color: var(--warning-color);
}

.notification.error i {
    color: var(--error-color);
}

.notification.info i {
    color: var(--primary-color);
}

.compatibility-warning {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.warning-content {
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    text-align: center;
}

.warning-content h3 {
    color: var(--warning-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.warning-content button {
    margin-top: 1rem;
}

.mouth-tracking-box {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(142, 84, 233, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(142, 84, 233, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(142, 84, 233, 0);
    }
}

.tracking-point {
    animation: blink 1.5s infinite;
}

@keyframes blink {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}
`;

document.head.appendChild(style); 