let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const minutesDisplay      = document.getElementById("minutes");
const secondsDisplay      = document.getElementById("seconds");
const timerDisplay = document.getElementById("timerDisplay");
const distractionMessage  = document.getElementById("distractionmessage");
const quoteBox            = document.getElementById("quoteBox");
const bgMusic             = document.getElementById("bgMusic");
const customMinutesInput = document.getElementById("customMinutes");
const volumeControl = document.getElementById("volumeControl");
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

  if (minutesDisplay && secondsDisplay) {
    minutesDisplay.textContent = mm;
    secondsDisplay.textContent = ss;
  }

  if (timerDisplay) {
    timerDisplay.textContent = `${mm} : ${ss}`;
  }

  document.title = isRunning ? `Focus: ${mm}:${ss} remaining` : "FocusVerse – Ready to begin";
}

function startButton() {
  if (isRunning) return;

  const inputMinutes = parseInt(customMinutesInput.value);
  if (isNaN(inputMinutes) || inputMinutes <= 0) {
    alert("Please enter valid minutes!");
    return;
  }

  minutes = inputMinutes;
  seconds = 0;
  updateDisplay();

  customMinutesInput.style.display = "none";
  document.getElementById("minute").style.display = "none";
  if (timerDisplay) timerDisplay.style.display = "inline-block";

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
  customMinutesInput.style.display = "inline-block";
  document.getElementById("minute").style.display = "inline-block";
  if (timerDisplay) timerDisplay.style.display = "none";
  customMinutesInput.value = 25;
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
