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

// State
let currentPlayer = null; // 'one' | 'two'
let timer = null;
let playerOneMoveCount = 0;
let playerTwoMoveCount = 0;
let movesSwitch = false;
let playerOneTime = 0.2 * 60; // seconds
let playerTwoTime = 0.2 * 60; // seconds
let isMuted = false;

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
  currentPlayer = nextPlayer;

  // Immediately apply first tick if enabled (mimics physical chess clocks where the displayed time changes as soon as you press)
  if (IMMEDIATE_FIRST_TICK) {
    if (nextPlayer === "one") {
      if (playerOneTime > 0) playerOneTime--;
    } else {
      if (playerTwoTime > 0) playerTwoTime--;
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
        playerOne.style.background = "red";
        playerOne.classList.remove("blink");
        clearInterval(timer);
      }
      if (playerOneTime > 0 && playerOneTime <= 10) {
        playSound("low");
        playerOne.classList.add("blink");
      }
    } else if (currentPlayer === "two") {
      if (playerTwoTime > 0) playerTwoTime--;
      if (playerTwoTime <= 0) {
        playerTwo.style.background = "red";
        playerTwo.classList.remove("blink");
        clearInterval(timer);
      }
      if (playerTwoTime > 0 && playerTwoTime <= 10) {
        playSound("low");
        playerTwo.classList.add("blink");
      }
    }
    updateTimer();
  }, 1000);
}

playerOne.addEventListener("click", () => {
  if (isGameOver()) return;

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

playerTwo.addEventListener("click", () => {
  if (isGameOver()) return;

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
}
updateTimer();

pauseBtn.addEventListener("click", () => {
  resumeBtn.style.display = "block";
  pauseBtn.style.display = "none";
  clearInterval(timer);
  playSound("resume");
});

resumeBtn.addEventListener("click", () => {
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "block";
  startTurn(currentPlayer);
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
  currentPlayer = null;
  playerOneTime = 0.2 * 60;
  playerTwoTime = 0.2 * 60;
  movesSwitch = false;
  playerTwoMoveCount = 0;
  playerOneMoveCount = 0;
  playerOneMoves.textContent = `Moves: ${playerOneMoveCount}`;
  playerTwoMoves.textContent = `Moves: ${playerTwoMoveCount}`;
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "block";
  playerOne.style.background = "white";
  playerTwo.style.background = "white";
  updateTimer();
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

//Registering the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
