let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let sessionStartTime = null;
let isOnline = navigator.onLine;

const minutesDisplay      = document.getElementById("minutes");
const secondsDisplay      = document.getElementById("seconds");
const distractionMessage  = document.getElementById("distractionmessage");
const quoteBox            = document.getElementById("quoteBox");
const bgMusic             = document.getElementById("bgMusic");
const offlineBanner       = document.getElementById("offlineBanner");
const sessionList         = document.getElementById("sessionList");

const quotes = [
  "🌿 Stay calm and keep going...",
  "✨ One step at a time!",
  "💪 You’re doing great!",
  "🚀 Focus fuels success!",
  "🔥 Don’t stop now!"
];

function updateDisplay() {
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  minutesDisplay.textContent = mm;
  secondsDisplay.textContent = ss;

  if (isRunning) {
    document.title = `Focus: ${mm}:${ss} remaining`;
  } else {
    document.title = "FocusVerse – Ready to begin";
  }
}

function startButton() {
  if (isRunning) return;
  isRunning = true;
  sessionStartTime = new Date();

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        saveSession(true);
        alert("⏰ Time's up! Great job! Take a short break.");
        document.title = "FocusVerse – Break Time!";
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    updateDisplay();
  }, 1000);

  updateDisplay();
}

function stopButton() {
  clearInterval(timer);
  isRunning = false;
  if (sessionStartTime) {
    saveSession(false);
  }
  updateDisplay();
}

function resetButton() {
  clearInterval(timer);
  isRunning = false;
  sessionStartTime = null;
  minutes = 25;
  seconds = 0;
  distractionMessage.innerHTML = "";
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  updateDisplay();
}

function gotdistracted() {
  distractionMessage.textContent = "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function controlVolume() {
    var volumeControl = document.getElementById("volumeControl");
    var slider = volumeControl.querySelector("#volumeControlSlider");
    bgMusic.volume = slider.value / 100;
    slider.oninput = function() {
        bgMusic.volume = this.value / 100;
    }
    slider.addEventListener("input", function () {
        const value = this.value;
        this.style.background = `linear-gradient(to right, rgb(150, 73, 5) ${value}%, #ccc ${value}%)`;
    });
}


function toggleMusic() {
    const volumeControl = document.getElementById("volumeControl");
    if (bgMusic.paused) {
        bgMusic.play();
        controlVolume();
        volumeControl.style.display = "inline";
    } else {
        bgMusic.pause();
        volumeControl.style.display = "none";
    }
}


updateDisplay();

// Offline detection
window.addEventListener('offline', () => {
    alert("📴 You're offline – timer and data still available!");
});

window.addEventListener('online', () => {
    alert("🌐 You're back online!");
});
