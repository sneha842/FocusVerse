let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const distractionMessage = document.getElementById("distractionmessage");
const quoteBox = document.getElementById("quoteBox");
const bgMusic = document.getElementById("bgMusic");
const streakDisplay = document.getElementById("streakDisplay");

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
    distractionMessage.innerHTML = "";
    quoteBox.innerHTML = quotes[Math.floor(Math.random() * quotes.length)];
    updateDisplay();
}

function gotdistracted() {
    distractionMessage.innerHTML = "🚨 Distraction Detected! Take a breath and refocus ✨";
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
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
}

function getTodayDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function updateStreakDisplay() {
    const streak = Number(localStorage.getItem('focusStreak')) || 0;
    if (streak > 0) {
        streakDisplay.textContent = `🔥 ${streak}-day streak`;
    } else {
        streakDisplay.textContent = '';
    }
}

function updateStreakOnSessionComplete() {
    const lastCompleted = localStorage.getItem('lastFocusDate');
    const today = getTodayDateString();
    let streak = Number(localStorage.getItem('focusStreak')) || 0;
    if (lastCompleted === today) {
        // Already counted today
        return;
    }
    if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const todayDate = new Date(today);
        const diff = (todayDate - lastDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            streak += 1;
        } else if (diff > 1) {
            streak = 1;
        }
    } else {
        streak = 1;
    }
    localStorage.setItem('focusStreak', streak);
    localStorage.setItem('lastFocusDate', today);
    updateStreakDisplay();
}

// Call updateStreakDisplay on load
updateStreakDisplay();
