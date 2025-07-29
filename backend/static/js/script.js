let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const distractionMessage = document.getElementById("distractionmessage");
const quoteBox = document.getElementById("quoteBox");
const bgMusic = document.getElementById("bgMusic");
const musicSource = document.getElementById("musicSource");

const quotes = [
  "🌿 Stay calm and keep going...",
  "✨ One step at a time!",
  "💪 You’re doing great!",
  "🚀 Focus fuels success!",
  "🔥 Don’t stop now!"
];

// Map themes to audio file paths
const musicMap = {
  piano: "/static/audio/piano.mp3",
  nature: "/static/audio/funeral.mp3",
  rain: "/static/audio/insp.mp3",
  campfire: "/static/audio/hist.mp3"
};

let currentTheme = null;

function updateDisplay() {
  minutesDisplay.textContent = String(minutes).padStart(2, '0');
  secondsDisplay.textContent = String(seconds).padStart(2, '0');
}

function startButton() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        alert("⏰ Time's up! Great job! Take a short break.");
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    updateDisplay();
  }, 1000);
}

function stopButton() {
  clearInterval(timer);
  isRunning = false;
}

function resetButton() {
  clearInterval(timer);
  isRunning = false;
  minutes = 25;
  seconds = 0;
  updateDisplay();
  distractionMessage.innerHTML = "";
  quoteBox.innerHTML = quotes[Math.floor(Math.random() * quotes.length)];
}

function gotdistracted() {
  distractionMessage.innerHTML = "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

function changeMusic(theme) {
  if (!musicMap[theme]) return;

  if (currentTheme === theme) {
    // Same theme clicked again - toggle play/pause
    if (bgMusic.paused) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  } else {
    // Different theme selected
    currentTheme = theme;
    bgMusic.pause();
    musicSource.src = musicMap[theme];
    bgMusic.load();
    bgMusic.play();
  }
}
