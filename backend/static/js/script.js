let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const distractionMessage = document.getElementById("distractionmessage");
const quoteBox = document.getElementById("quoteBox");
const bgMusic = document.getElementById("bgMusic");
const moodAudio = document.getElementById("moodAudio");


const quotes = [
    "🌿 Stay calm and keep going...",
    "✨ One step at a time!",
    "💪 You’re doing great!",
    "🚀 Focus fuels success!",
    "🔥 Don’t stop now!"
];

const moodTracks = {
  relaxed: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
  focused: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
  energetic: "https://www.bensound.com/bensound-music/bensound-energy.mp3",
  calm: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
  motivated: "https://www.bensound.com/bensound-music/bensound-goinghigher.mp3"
};

let currentMood = null;

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
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

function toggleMood(mood) {
  if (currentMood === mood && !moodAudio.paused) {
    moodAudio.pause();
    currentMood = null;
  } else {
    moodAudio.src = moodTracks[mood];
    moodAudio.play();
    currentMood = mood;
  }
}