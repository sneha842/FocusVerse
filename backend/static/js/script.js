let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const distractionMessage = document.getElementById("distractionmessage");
const quoteBox = document.getElementById("quoteBox");
const bgMusic = document.getElementById("bgMusic");
const musicSource = document.getElementById("musicSource"); // Added musicSource from PR

const quotes = [
  "🌿 Stay calm and keep going...",
  "✨ One step at a time!",
  "💪 You’re doing great!",
  "🚀 Focus fuels success!",
  "🔥 Don’t stop now!",
];

// Music theme to file path map from PR
const musicMap = {
  piano: "/static/audio/piano.mp3",
  nature: "/static/audio/funeral.mp3",
  rain: "/static/audio/insp.mp3",
  campfire: "/static/audio/hist.mp3",
};

let currentTheme = null;

function updateDisplay() {
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
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

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
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
  updateDisplay();
}

function resetButton() {
  clearInterval(timer);
  isRunning = false;
  minutes = 25;
  seconds = 0;
  distractionMessage.innerHTML = "";
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  updateDisplay();
}

function gotdistracted() {
  distractionMessage.textContent =
    "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function controlVolume() {
  const volumeControl = document.getElementById("volumeControl");
  const slider = volumeControl.querySelector("#volumeControlSlider");
  bgMusic.volume = slider.value / 100;

  slider.oninput = function () {
    bgMusic.volume = this.value / 100;
  };

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

function changeMusic(theme) {
  const volumeControl = document.getElementById("volumeControl");

  if (!musicMap[theme]) return;

  if (currentTheme === theme) {
    if (bgMusic.paused) {
      bgMusic.play();
    } else {
      bgMusic.pause();
      volumeControl.style.display = "none";
    }
  } else {
    currentTheme = theme;
    bgMusic.pause();
    musicSource.src = musicMap[theme];
    bgMusic.load();
    bgMusic.play();
    controlVolume();
    volumeControl.style.display = "inline";
  }
}

updateDisplay();
