const playerOne = document.getElementById("timer-component-one");
const playerTwo = document.getElementById("timer-component-two");
const playerOneTimer = document.getElementById("time-one");
const playerTwoTimer = document.getElementById("time-two");
const playerOneMoves = document.getElementById("moves-one");
const playerTwoMoves = document.getElementById("moves-two");

// State
let currentPlayer = null; // 'one' | 'two'
let timer = null;
let playerOneMoveCount = 0;
let playerTwoMoveCount = 0;
let movesSwitch = false;
let playerOneTime = 0.2 * 60; // seconds
let playerTwoTime = 0.2 * 60; // seconds

// Config: set to true to show the next player's timer decrement immediately (no 1s visual delay)
const IMMEDIATE_FIRST_TICK = true;

function startTurn(nextPlayer) {
  if (isGameOver()) return; // don't start new turns after game end
  if (currentPlayer === nextPlayer) return; // already that player's turn
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
        clearInterval(timer);
      }
    } else if (currentPlayer === "two") {
      if (playerTwoTime > 0) playerTwoTime--;
      if (playerTwoTime <= 0) {
        playerTwo.style.background = "red";
        clearInterval(timer);
      }
    }
    updateTimer();
  }, 1000);
}

playerOne.addEventListener("click", () => {
  if (isGameOver()) return;
  if (currentPlayer === null || currentPlayer === "one") {
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
