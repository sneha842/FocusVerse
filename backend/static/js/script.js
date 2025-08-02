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

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const distractionMessage = document.getElementById("distractionmessage");
const quoteBox = document.getElementById("quoteBox");
const bgMusic = document.getElementById("bgMusic");
const streakDisplay = document.getElementById("streakDisplay");

//----------------------API for random quotes---------------------------------
function fetchRandomQuotes(){
  const url = 'https://corsproxy.io/?https://api.quotable.io/random?maxLength=100';
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Error');
      return response.json();
    })
    .then(data => {
      quoteBox.textContent = `"${data.content} - ${data.author}"`;
    })
    .catch(error => {
      console.error('Error:', error);
      const fallbackQuotes = [
        "🌿 Stay calm and keep going...",
        "✨ One step at a time!",
        "💪 You’re doing great!",
        "🚀 Focus fuels success!",
        "🔥 Don’t stop now!"
      ];
      quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    });
}

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

    updateDisplay();
  }, 1000);

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
  customMinutesInput.style.display = "inline-block";
  document.getElementById("minute").style.display = "inline-block";
  if (timerDisplay) timerDisplay.style.display = "none";
  customMinutesInput.value = 25;
  distractionMessage.innerHTML = "";
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  updateDisplay();

    clearInterval(timer);
    isRunning = false;
    minutes = 25;
    seconds = 0;
    distractionMessage.innerHTML = "";
    quoteBox.innerHTML = quotes[Math.floor(Math.random() * quotes.length)];
    updateDisplay();
}

function gotdistracted() {
    distractionMessage.innerHTML = "🚨 Distraction Detected! Take a breath and refocus ✨";
}

function controlVolume() {
    var volumeControl = document.getElementById("volumeControl");
    var slider = volumeControl.querySelector("#volumeControlSlider");
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
    var volumeControl = document.getElementById("volumeControl");
    if (bgMusic.paused) {
        bgMusic.play();
        controlVolume();
        volumeControl.style.display = "inline";
    } else {
        bgMusic.pause();
        volumeControl.style.display = "none";
    }
+
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}
function updateStreakOnSessionComplete() {
    let streak = localStorage.getItem('focusStreak');

    // If no streak exists, start at 1
    if (!streak) {
        streak = 1;
    } else {
        streak = parseInt(streak) + 1;
    }

    localStorage.setItem('focusStreak', streak);
    displayStreak();
}

function displayStreak() {
    let streak = localStorage.getItem('focusStreak') || 0;
    const streakDisplay = document.getElementById('streakDisplay');
    if (streakDisplay) {
        streakDisplay.textContent = `🔥 Your Focus Streak: ${streak} sessions`;
    }
}


updateDisplay();
fetchRandomQuotes();
window.onload = function () {
    displayStreak();
}
