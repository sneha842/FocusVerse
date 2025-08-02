let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let sessionStartTime = null;
let isOnline = navigator.onLine;

const minutesDisplay      = document.getElementById("minutes");
const secondsDisplay      = document.getElementById("seconds");
const timerDisplay        = document.getElementById("timerDisplay");
const distractionMessage  = document.getElementById("distractionmessage");
const quoteBox            = document.getElementById("quoteBox");
const bgMusic             = document.getElementById("bgMusic");
const alarmSound          = document.getElementById("alarmSound");
const customMinutesInput  = document.getElementById("customMinutes");
const streakDisplay       = document.getElementById("streakDisplay");
const volumeSlider        = document.getElementById("volumeControlSlider");
const volumeControl       = document.getElementById("volumeControl");

const fallbackQuotes = [
  "🌿 Stay calm and keep going...",
  "✨ One step at a time!",
  "💪 You're doing great!",
  "🚀 Focus fuels success!",
  "🔥 Don't stop now!"
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
  timerDisplay.style.display = "inline-block";

  isRunning = true;
  sessionStartTime = new Date();

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        if (alarmSound) alarmSound.play();
        saveSession(true);
        alert("⏰ Time's up! Great job! Take a short break.");
        document.title = "FocusVerse – Break Time!";
        updateStreakOnSessionComplete();
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
  if (sessionStartTime) saveSession(false);
  updateDisplay();
}

function resetButton() {
  clearInterval(timer);
  isRunning = false;
  sessionStartTime = null;
  minutes = 25;
  seconds = 0;

  customMinutesInput.style.display = "inline-block";
  document.getElementById("minute").style.display = "inline-block";
  timerDisplay.style.display = "none";
  customMinutesInput.value = 25;

  distractionMessage.innerHTML = "";
  quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  updateDisplay();
}

function gotdistracted() {
  distractionMessage.innerHTML = "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function controlVolume() {
  bgMusic.volume = volumeSlider.value / 100;
  volumeSlider.addEventListener("input", function () {
    bgMusic.volume = this.value / 100;
    this.style.background = `linear-gradient(to right, rgb(150, 73, 5) ${this.value}%, #ccc ${this.value}%)`;
  });
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
    controlVolume();
    volumeControl.style.display = "inline";
  } else {
    bgMusic.pause();
    volumeControl.style.display = "none";
  }
}

function fetchRandomQuotes() {
  const url = 'https://corsproxy.io/?https://api.quotable.io/random?maxLength=100';
  fetch(url)
    .then(res => res.json())
    .then(data => {
      quoteBox.textContent = `"${data.content}" - ${data.author}`;
    })
    .catch(() => {
      quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    });
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function updateStreakDisplay() {
  const streak = Number(localStorage.getItem('focusStreak')) || 0;
  streakDisplay.textContent = streak > 0 ? `🔥 ${streak}-day streak` : '';
}

function updateStreakOnSessionComplete() {
  const lastCompleted = localStorage.getItem('lastFocusDate');
  const today = getTodayDateString();
  let streak = Number(localStorage.getItem('focusStreak')) || 0;

  if (lastCompleted !== today) {
    if (lastCompleted) {
      const diff = (new Date(today) - new Date(lastCompleted)) / (1000 * 60 * 60 * 24);
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    localStorage.setItem('focusStreak', streak);
    localStorage.setItem('lastFocusDate', today);
  }

  updateStreakDisplay();
}

function saveSession(completed) {
  const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
  const session = {
    startTime: sessionStartTime,
    endTime: new Date(),
    completed,
    duration: completed && sessionStartTime ? (new Date() - sessionStartTime) / 1000 : 0
  };
  sessions.push(session);
  localStorage.setItem('focusSessions', JSON.stringify(sessions));
}

window.addEventListener('offline', () => alert("📴 You're offline – timer and data still available!"));
window.addEventListener('online', () => alert("🌐 You're back online!"));

window.onload = () => {
  updateDisplay();
  fetchRandomQuotes();
  updateStreakDisplay();
};
