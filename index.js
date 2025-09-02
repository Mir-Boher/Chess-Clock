const playerOne = document.getElementById("timer-component-one");
const playerTwo = document.getElementById("timer-component-two");
const playerOneTimer = document.getElementById("time-one");
const playerTwoTimer = document.getElementById("time-two");
const playerOneMoves = document.getElementById("moves-one");
const playerTwoMoves = document.getElementById("moves-two");
const pauseBtn = document.querySelector(".pause-icon");
const resumeBtn = document.querySelector(".resume-icon");
const resetBtn = document.querySelector(".replay-icon");
const volumeOnBtn = document.querySelector(".volume-on-icon");
const volumeOffBtn = document.querySelector(".volume-off-icon");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelectorAll(".close");
const playerOneSettingsBtn = document.querySelector(".settings-one");
const playerTwoSettingsBtn = document.querySelector(".settings-two");
const settingsHours = document.getElementById("hours");
const settingsMinutes = document.getElementById("minutes");
const settingsSeconds = document.getElementById("seconds");
const saveSettings = document.getElementById("save-btn");
const settingsIncrement = document.getElementById("increment");
const settingsLowTimeAlert = document.getElementById("low-time-alert");
const modeTimeOne = document.querySelector(".time-increment-text-one"); // 5 | 3 mode ...suppose
const modeTimeTwo = document.querySelector(".time-increment-text-two");

// State
let currentPlayer = null; // 'one' or 'two' Initialing null
let timer = null;
let playerOneMoveCount = 0;
let playerTwoMoveCount = 0;
let movesSwitch = false; // To track the first move for updating the move count
let playerOneTime = 2 * 60; // default time "seconds"
let playerTwoTime = 2 * 60; // default time "seconds"
let isMuted = false;
let settingsTarget = null; // one or two "Modal settings"
let playerOneIncrement = 0;
let playerTwoIncrement = 0;
let playerOneLowTimeAlert = 10; //default value
let playerTwoLowTimeAlert = 10;

const sounds = {
  click: new Audio("assets/sounds/click.wav"),
  resume: new Audio("assets/sounds/resume.wav"),
  low: new Audio("assets/sounds/femalelow.wav"),
};

// Config: set to true to show the next player's timer decrement immediately (no 1s visual delay)
const IMMEDIATE_FIRST_TICK = true;

function startTurn(nextPlayer) {
  if (isGameOver()) return; // don't start new turns after game end
  clearInterval(timer);

  if (
    currentPlayer === "one" &&
    playerOneIncrement > 0 &&
    currentPlayer !== nextPlayer
  ) {
    playerOneTime += playerOneIncrement;
  } else if (
    currentPlayer === "two" &&
    playerTwoIncrement > 0 &&
    currentPlayer !== nextPlayer
  ) {
    playerTwoTime += playerTwoIncrement;
  }

  currentPlayer = nextPlayer;

  // Immediately apply first tick if enabled (mimics physical chess clocks where the displayed time changes as soon as you press)
  if (IMMEDIATE_FIRST_TICK) {
    if (nextPlayer === "one") {
      if (playerOneTime > 0) playerOneTime--;
      if (playerOneTime > 0 && playerOneTime <= playerOneLowTimeAlert) {
        playerOne.classList.add("blink");
        playSound("low");
      }
    } else {
      if (playerTwoTime > 0) playerTwoTime--;
      if (playerTwoTime > 0 && playerTwoTime <= playerTwoLowTimeAlert) {
        playerTwo.classList.add("blink");
        playSound("low");
      }
    }
    updateTimer();
  }

  // Guard if time already expired after immediate tick
  if (isGameOver()) return;

  // Use setInterval for now; could be swapped to a drift-correcting loop later
  timer = setInterval(() => {
    if (currentPlayer === "one") {
      if (playerOneTime > 0) playerOneTime--;
      if (playerOneTime <= 0) {
        playerOne.classList.remove("blink");
        clearInterval(timer);
      }
      if (playerOneTime > 0 && playerOneTime <= playerOneLowTimeAlert) {
        playSound("low");
        playerOne.classList.add("blink");
      }
    } else if (currentPlayer === "two") {
      if (playerTwoTime > 0) playerTwoTime--;
      if (playerTwoTime <= 0) {
        playerTwo.classList.remove("blink");
        clearInterval(timer);
      }
      if (playerTwoTime > 0 && playerTwoTime <= playerTwoLowTimeAlert) {
        playSound("low");
        playerTwo.classList.add("blink");
      }
    }
    updateTimer();
  }, 1000);
}

playerOne.addEventListener("click", (e) => {
  if (e.target.closest(".settings-one")) return;
  if (isGameOver()) return;

  // Hide the resume button after clicking
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "block";

  if (currentPlayer === null || currentPlayer === "one") {
    playerOne.classList.remove("blink");

    playSound("click");
    if (movesSwitch === true) {
      playerOneMoves.textContent = `Moves: ${++playerOneMoveCount}`;
    }
    movesSwitch = true;
    startTurn("two");
  }
});

playerTwo.addEventListener("click", (e) => {
  if (e.target.closest(".settings-two")) return;
  if (isGameOver()) return;

  // Hide the resume button after clicking
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "block";

  if (currentPlayer === null || currentPlayer === "two") {
    playerTwo.classList.remove("blink");
    playSound("click");
    if (movesSwitch === true) {
      playerTwoMoves.textContent = `Moves: ${++playerTwoMoveCount}`;
    }
    movesSwitch = true;
    startTurn("one");
  }
});

function isGameOver() {
  return playerOneTime <= 0 || playerTwoTime <= 0;
}

function updateTimer() {
  const minutesOne = Math.floor(playerOneTime / 60);
  const secondsOne = playerOneTime % 60;
  playerOneTimer.textContent = `${minutesOne}:${secondsOne
    .toString()
    .padStart(2, "0")}`;

  const minutesTwo = Math.floor(playerTwoTime / 60);
  const secondsTwo = playerTwoTime % 60;
  playerTwoTimer.textContent = `${minutesTwo}:${secondsTwo
    .toString()
    .padStart(2, "0")}`;

  // Always update red background if time is 0
  if (playerOneTime <= 0) {
    playerOne.style.background = "red";
    playerOne.classList.remove("blink");
  }
  if (playerTwoTime <= 0) {
    playerTwo.style.background = "red";
    playerTwo.classList.remove("blink");
  }
}
updateTimer();

pauseBtn.addEventListener("click", () => {
  resumeBtn.style.display = "block";
  pauseBtn.style.display = "none";
  clearInterval(timer);
  playSound("resume");
  playerTwo.classList.remove("blink");
  playerOne.classList.remove("blink");
});

resumeBtn.addEventListener("click", () => {
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "block";
  // when we start game by clicking resume btn instead of player's time component
  if (currentPlayer === null) {
    movesSwitch = true;
    startTurn("two");
  } else {
    startTurn(currentPlayer);
  }
  playSound("resume");
});

volumeOnBtn.addEventListener("click", () => {
  isMuted = true;
  volumeOnBtn.style.display = "none";
  volumeOffBtn.style.display = "block";
});
volumeOffBtn.addEventListener("click", () => {
  isMuted = false;
  volumeOnBtn.style.display = "block";
  volumeOffBtn.style.display = "none";
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  playerTwo.classList.remove("blink");
  playerOne.classList.remove("blink");
  currentPlayer = null;
  playerOneTime = 2 * 60;
  playerTwoTime = 2 * 60;
  movesSwitch = false;
  playerTwoMoveCount = 0;
  playerOneMoveCount = 0;
  playerOneMoves.textContent = `Moves: ${playerOneMoveCount}`;
  playerTwoMoves.textContent = `Moves: ${playerTwoMoveCount}`;
  resumeBtn.style.display = "block";
  pauseBtn.style.display = "none";
  playerOne.style.background = "white";
  playerTwo.style.background = "white";
  updateTimer();
});

playerOneSettingsBtn.addEventListener("click", () => {
  settingsTarget = "one";
  console.log("Player One time :", playerOneTime);
  settingsMinutes.value = parseInt(playerOneTime / 60);
  settingsSeconds.value = parseInt(playerOneTime % 60);
  modalOverlay.style.display = "block";
  modalOverlay.style.rotate = "180deg"; // rotating the modal for player one
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "block"; // So one could start the clock after hitting resume btn
  clearInterval(timer);
});

playerTwoSettingsBtn.addEventListener("click", () => {
  settingsTarget = "two";
  settingsMinutes.value = parseInt(playerTwoTime / 60);
  settingsSeconds.value = parseInt(playerTwoTime % 60);
  modalOverlay.style.display = "block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "block"; // So one could start the clock after hitting resume btn
  clearInterval(timer);
});

//There are two elements in html that closes the modal "cancel/cross"
closeBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    modalOverlay.style.rotate = "0deg"; // setting modal rotate to default for player Two
  });
});

saveSettings.addEventListener("click", () => {
  const hours = parseInt(settingsHours.value) || 0;
  const minutes = parseInt(settingsMinutes.value) || 0;
  const seconds = parseInt(settingsSeconds.value) || 0;
  const increment = parseInt(settingsIncrement.value) || 0;
  const lowTimeAlert = parseInt(settingsLowTimeAlert.value) || 0;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (settingsTarget === "one") {
    playerOneTime = totalSeconds;
    playerOneIncrement = increment;
    playerOneLowTimeAlert = lowTimeAlert;
    modeTimeOne.textContent = `${minutes} | ${increment}`; // update mode time "minutes | secs"
  } else if (settingsTarget === "two") {
    playerTwoTime = totalSeconds;
    playerTwoIncrement = increment;
    playerTwoLowTimeAlert = lowTimeAlert;
    modeTimeTwo.textContent = `${minutes} | ${increment}`; // update mode time "mins | secs"
  }
  updateTimer();
  modalOverlay.style.display = "none";
});

function playSound(name) {
  if (!isMuted) {
    const sound = sounds[name];
    if (sound) {
      sound.currentTime = 0; // rewind so it plays from start
      sound.play();
    }
  }
}

//Validate the input field of settings
function validateInput(input) {
  // Limit to 2 digits
  if (input.value.length > 2) {
    input.value = input.value.slice(0, 2);
  }
  // Ensure value doesn't exceed max
  if (parseInt(input.value) > 59) {
    input.value = 59;
  }
}

// Registering the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js") // Add leading slash
      .then((registration) => {
        console.log("Service Worker registered successfully");
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
