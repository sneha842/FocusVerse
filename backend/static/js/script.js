let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let isPaused = false; // Tracks if the timer is paused (stopped mid-session)
let isRefocusing = false; // Tracks if currently in refocus mode
let originalMinutes = 0; // Store original timer state
let originalSeconds = 0; // Store original timer state
let refocusTimer; // Timer for refocus period

let isFocusMode = true;
const minutesDisplay      = document.getElementById("minutes");
const secondsDisplay      = document.getElementById("seconds");
const timerDisplay        = document.getElementById("timerDisplay");
const pauseStatus         = document.getElementById("pauseStatus");
const distractionMessage  = document.getElementById("distractionmessage");
const quoteBox            = document.getElementById("quoteBox");
const bgMusic             = document.getElementById("bgMusic");
const alarmSound          = document.getElementById("alarmSound");
const customFocusInput    = document.getElementById("customFocusMinutes");
const customBreakInput    = document.getElementById("customBreakMinutes");
const streakDisplay       = document.getElementById("streakDisplay");
const volumeSlider        = document.getElementById("volumeControlSlider");
const volumeControl       = document.getElementById("volumeControl");

const fallbackQuotes = [
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
  // Update document title based on current state
  if (isRefocusing) {
    document.title = `Refocus Break: ${mm}:${ss} remaining`;
  } else if (isRunning) {
    document.title = `${isFocusMode ? "Focus" : "Break"}: ${mm}:${ss} remaining`;
  } else if (isPaused && (minutes > 0 || seconds > 0)) {
    document.title = `Paused at ${mm}:${ss} – FocusVerse`;
  } else {
    document.title = "FocusVerse – Ready to begin";
  }

}

function startButton() {
  if (isRunning) return; // already running

  // If resuming after pause (including refocus), don't reset minutes/seconds
  if (!isPaused && !isRefocusing) {
    const inputMinutes = parseInt(customFocusInput.value);
    if (!isNaN(inputMinutes) && inputMinutes > 0) {
      minutes = inputMinutes;
      seconds = 0;
    }
  }

  // Hide inputs and prepare UI
  customFocusInput.style.display = "none";
  customBreakInput.style.display = "none";
  document.querySelectorAll(".minute").forEach(el => el.style.display = "none");

  if (timerDisplay) timerDisplay.style.display = "inline-block";
  if (pauseStatus) pauseStatus.style.display = "none";

  isRunning = true;
  isPaused = false;

  timer = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        if (alarmSound) alarmSound.play();

        if (isFocusMode) {
          alert("⏰ Focus session complete! Time for a break.");
          updateStreakOnSessionComplete();
        } else {
          alert("✅ Break over! Time to focus.");
        }
        isFocusMode = !isFocusMode;
        startButton();
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
  if (!isRunning && !isRefocusing) return;
  
  if (isRefocusing) {
    // Stop refocus timer and restore original state
    clearInterval(refocusTimer);
    isRefocusing = false;
    minutes = originalMinutes;
    seconds = originalSeconds;
    
    // Reset display styling
    if (timerDisplay) {
      timerDisplay.style.color = "";
      timerDisplay.style.border = "";
      timerDisplay.style.borderRadius = "";
      timerDisplay.style.padding = "";
    }
    
    // Clear distraction message
    const distractionMsg = document.getElementById("distractionmessage");
    distractionMsg.innerHTML = "";
  } else {
    clearInterval(timer);
    isRunning = false;
  }
  
  isPaused = true;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (pauseStatus) {
    pauseStatus.textContent = `⏸️ Paused at ${mm}:${ss}`;
    pauseStatus.style.display = "block";
  }
  updateDisplay();
}

function resetButton() {
  const confirmReset = confirm("Reset the timer? This will clear the current session and progress for this cycle.");
  if (!confirmReset) return;

  // Clear all timers
  clearInterval(timer);
  if (isRefocusing) {
    clearInterval(refocusTimer);
  }
  
  // Reset all states
  isRunning = false;
  isRefocusing = false;
  isFocusMode = true;
  isPaused = false;
  minutes = 25;
  seconds = 0;

  // Reset display styling
  if (timerDisplay) {
    timerDisplay.style.color = "";
    timerDisplay.style.border = "";
    timerDisplay.style.borderRadius = "";
    timerDisplay.style.padding = "";
    timerDisplay.style.display = "none";
  }

  customFocusInput.style.display = "inline-block";
  customBreakInput.style.display = "inline-block";
  document.querySelectorAll(".minute").forEach(el => el.style.display = "inline-block");

  if (pauseStatus) pauseStatus.style.display = "none";

  // Clear distraction message
  const distractionMsg = document.getElementById("distractionmessage");
  if (distractionMsg) distractionMsg.innerHTML = "";
  
  quoteBox.textContent = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  updateDisplay();
}

function gotdistracted() {
    // Add button pressed animation
    const button = event.target;
    button.classList.add('button-pressed');
    setTimeout(() => button.classList.remove('button-pressed'), 300);

    // Show enhanced distraction message
    const distractionMsg = document.getElementById("distractionmessage");
    distractionMsg.innerHTML = "<span style='color: #ff5722; font-weight: bold; font-size: 1.1em;'>🌟 Distraction Detected! Take a breath and refocus ✨ 🌿 Stay calm and keep going...</span>";

    if (!isRunning) {
        // If timer isn't running, just show message and return
        setTimeout(() => {
            distractionMsg.innerHTML = "";
        }, 3000);
        return;
    }

    // Store current timer state
    originalMinutes = minutes;
    originalSeconds = seconds;
    
    // Stop main timer
    clearInterval(timer);
    isRunning = false;
    isRefocusing = true;

    // Start 5-minute refocus timer
    let refocusMinutes = 5;
    let refocusSeconds = 0;
    
    // Update display to show refocus timer
    minutes = refocusMinutes;
    seconds = refocusSeconds;
    updateDisplay();
    
    // Add refocus indicator to title
    if (timerDisplay) {
        timerDisplay.style.color = "#ff9800";
        timerDisplay.style.border = "2px solid #ff9800";
        timerDisplay.style.borderRadius = "8px";
        timerDisplay.style.padding = "5px";
    }
    
    distractionMsg.innerHTML += "<br><span style='color: #ff9800; font-size: 0.9em;'>⏱️ 5-minute refocus break started...</span>";

    refocusTimer = setInterval(() => {
        if (refocusSeconds === 0) {
            if (refocusMinutes === 0) {
                // Refocus period complete
                clearInterval(refocusTimer);
                isRefocusing = false;
                
                // Restore original timer state
                minutes = originalMinutes;
                seconds = originalSeconds;
                
                // Reset display styling
                if (timerDisplay) {
                    timerDisplay.style.color = "";
                    timerDisplay.style.border = "";
                    timerDisplay.style.borderRadius = "";
                    timerDisplay.style.padding = "";
                }
                
                // Clear distraction message
                distractionMsg.innerHTML = "<span style='color: #4caf50; font-weight: bold;'>🎯 Refocus complete! Ready to continue...</span>";
                setTimeout(() => {
                    distractionMsg.innerHTML = "";
                }, 2000);
                
                // Resume main timer
                startButton();
                return;
            }
            refocusMinutes--;
            refocusSeconds = 59;
        } else {
            refocusSeconds--;
        }
        
        // Update display with refocus timer
        minutes = refocusMinutes;
        seconds = refocusSeconds;
        updateDisplay();
    }, 1000);
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

function updateStreakOnSessionComplete() {
  let streak = localStorage.getItem('focusStreak');
  streak = streak ? parseInt(streak) + 1 : 1;
  localStorage.setItem('focusStreak', streak);
  displayStreak();
}

function displayStreak() {
  let streak = localStorage.getItem('focusStreak') || 0;
  streakDisplay.textContent = `🔥 Your Focus Streak: ${streak} sessions`;
}

window.addEventListener('offline', () => alert("📴 You're offline – timer and data still available!"));
window.addEventListener('online', () => alert("🌐 You're back online!"));

window.onload = () => {
  updateDisplay();
  fetchRandomQuotes();
  displayStreak();
};
