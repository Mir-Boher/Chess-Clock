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
const timerBtn = document.querySelector(".timer-icon");
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
const mainPage = document.getElementById("main-page");
const timeControlPage = document.getElementById("time-control-page");
const customTimePage = document.getElementById("custom-time-page");
const arrowBackBtns = document.querySelectorAll(".arrow-back");
const customTimeBtn = document.querySelector(".custom-time");
const modeContainer = document.querySelector(".mode-container");
const startBtn = document.getElementById("start-btn");
const soundToggle = document.getElementById("sound-toggle");
const bgAlertToggle = document.getElementById("bg-alert-toggle");
const customMinutes = document.getElementById("custom-time");
const customIncrements = document.getElementById("custom-increment");
const customSaveBtn = document.getElementById("save-custom-time-btn");
const loginPage = document.getElementById("login-page");
const loginBtn = document.querySelector(".btn-login");
const loginEmail = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const signupPage = document.getElementById("signup-page");
const signupForm = document.getElementById("signup-form");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupUsername = document.getElementById("signup-username");
const signupBtn = document.querySelector(".btn-signup");
const showSignupPage = document.getElementById("show-signup");
const showLoginPage = document.getElementById("show-login");
const profileBtn = document.querySelector(".profile-setting");
const profileContainer = document.querySelector(".profile-container");
const playerName = document.querySelector(".title");
const logoutBtn = document.querySelector(".logout-btn");
const splashScreenPage = document.getElementById("splash-screen");

async function loadCustomTimes() {
  // Remove previously rendered custom items to avoid duplicates
  document.querySelectorAll(".mode.custom").forEach((el) => el.remove());

  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    const snap = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .collection("customTimes")
      .orderBy("createdAt", "desc")
      .get();

    snap.forEach((doc) => {
      const data = doc.data();
      const newMode = document.createElement("div");
      newMode.classList.add("mode", "custom"); // mark as custom
      newMode.setAttribute("data-minutes", String(data.minutes));
      newMode.setAttribute("data-increment", String(data.increment));
      newMode.textContent = `${data.minutes} min | ${data.increment} sec`;
      modeContainer.appendChild(newMode);
    });
  } catch (err) {
    console.error("Failed to load custom times:", err);
  }
}

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const docSnap = await firebase.firestore().doc(`users/${user.uid}`).get();
    if (docSnap.exists) {
      mainPage.style.display = "flex";
      loginPage.style.display = "none";
      signupPage.style.display = "none";
      timeControlPage.style.display = "none";

      const username = docSnap.data().username;
      playerName.textContent = username;

      await loadCustomTimes();

      splashScreenPage.style.display = "none";
    } else {
      await firebase.auth().signOut();
      mainPage.style.display = "none";
      loginPage.style.display = "none";
      timeControlPage.style.display = "none";
      signupPage.style.display = "block";
      splashScreenPage.style.display = "none";
    }
  } else {
    mainPage.style.display = "none";
    signupPage.style.display = "none";
    timeControlPage.style.display = "none";
    loginPage.style.display = "block";
    splashScreenPage.style.display = "none";
  }
});

logoutBtn.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // alert("You have been logged out!");
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
});

// State
let currentPlayer = null;
let timer = null;
let playerOneMoveCount = 0;
let playerTwoMoveCount = 0;
let movesSwitch = false; // To track the first move for updating the move count
let isMuted = false;
let settingsTarget = null; // one or two "Modal settings"
let playerOneLowTimeAlert = 10;
let playerTwoLowTimeAlert = 10;
let selectedMinutes = 2; // default value
let selectedIncrements = 0;
let playerOneTime = selectedMinutes * 60;
let playerTwoTime = selectedMinutes * 60;
let playerOneIncrement = selectedIncrements;
let playerTwoIncrement = selectedIncrements;
let playerOneBgAlertToggle = true;
let playerTwoBgAlertToggle = true;
let playerOneSoundToggle = true;
let playerTwoSoundToggle = true;

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
      if (
        playerOneTime > 0 &&
        playerOneTime <= playerOneLowTimeAlert &&
        playerOneSoundToggle
      ) {
        console.log("The sound is playing..." + playerOneSoundToggle);
        playSound("low");
      }
      if (
        showLowTimeAlert(
          playerOneTime,
          playerOneBgAlertToggle,
          playerOneLowTimeAlert
        )
      ) {
        playerOne.classList.add("blink");
      }
    } else {
      if (playerTwoTime > 0) playerTwoTime--;
      if (
        playerTwoTime > 0 &&
        playerTwoTime <= playerTwoLowTimeAlert &&
        playerTwoSoundToggle
      ) {
        playSound("low");
      }
      if (
        playerTwoTime > 0 &&
        playerTwoBgAlertToggle &&
        playerTwoTime <= playerTwoLowTimeAlert
      ) {
        playerTwo.classList.add("blink");
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
      if (
        playerOneTime > 0 &&
        playerOneTime <= playerOneLowTimeAlert &&
        playerOneSoundToggle
      ) {
        playSound("low");
      }
      if (
        playerOneTime > 0 &&
        playerOneBgAlertToggle &&
        playerOneTime <= playerOneLowTimeAlert
      ) {
        playerOne.classList.add("blink");
      }
    } else if (currentPlayer === "two") {
      if (playerTwoTime > 0) playerTwoTime--;
      if (playerTwoTime <= 0) {
        playerTwo.classList.remove("blink");
        clearInterval(timer);
      }
      if (
        playerTwoTime > 0 &&
        playerTwoTime <= playerTwoLowTimeAlert &&
        playerTwoSoundToggle
      ) {
        playSound("low");
      }
      if (
        playerTwoTime > 0 &&
        playerTwoBgAlertToggle &&
        playerTwoTime <= playerTwoLowTimeAlert
      ) {
        playerTwo.classList.add("blink");
      }
    }
    updateTimer();
  }, 1000);
}

playerOne.addEventListener("click", (e) => {
  if (e.target.closest(".settings-one")) return;
  if (isGameOver()) return;

  // resumeBtn.style.display = "none";
  // pauseBtn.style.display = "block";

  if (currentPlayer === null || currentPlayer === "one") {
    resumeBtn.style.display = "none";
    pauseBtn.style.display = "block";
    playerOne.classList.remove("blink");
    playSound("click");

    if (movesSwitch === true) {
      playerOneMoves.textContent = `Moves: ${++playerOneMoveCount}`;
    }
    movesSwitch = true;

    setActiveTurnBg("two");
    startTurn("two");
  }
});

playerTwo.addEventListener("click", (e) => {
  if (e.target.closest(".settings-two")) return;
  if (isGameOver()) return;

  if (currentPlayer === null || currentPlayer === "two") {
    resumeBtn.style.display = "none";
    pauseBtn.style.display = "block";
    playerTwo.classList.remove("blink");

    playSound("click");
    if (movesSwitch === true) {
      playerTwoMoves.textContent = `Moves: ${++playerTwoMoveCount}`;
    }
    movesSwitch = true;

    setActiveTurnBg("one");
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
    setActiveTurnBg("two");
  } else {
    startTurn(currentPlayer);
    if (currentPlayer === "one") {
      setActiveTurnBg("one");
    } else {
      setActiveTurnBg("two");
    }
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
  movesSwitch = false;
  playerOneTime = selectedMinutes * 60;
  playerOneIncrement = selectedIncrements;
  playerTwoTime = selectedMinutes * 60;
  playerTwoIncrement = selectedIncrements;
  playerTwoMoveCount = 0;
  playerOneMoveCount = 0;
  playerOneMoves.textContent = `Moves: ${playerOneMoveCount}`;
  playerTwoMoves.textContent = `Moves: ${playerTwoMoveCount}`;
  modeTimeOne.textContent = `${selectedMinutes} | ${selectedIncrements}`;
  modeTimeTwo.textContent = `${selectedMinutes} | ${selectedIncrements}`;
  resumeBtn.style.display = "block";
  pauseBtn.style.display = "none";
  playerOne.style.background = "";
  playerTwo.style.background = "";
  playerOne.classList.remove("active-turn-bg");
  playerTwo.classList.remove("active-turn-bg");
  updateTimer();
});

playerOneSettingsBtn.addEventListener("click", () => {
  settingsTarget = "one";
  console.log("Player One time :", playerOneTime);
  settingsMinutes.value = parseInt(playerOneTime / 60);
  settingsSeconds.value = parseInt(playerOneTime % 60);
  modalOverlay.style.display = "block";
  modalOverlay.style.rotate = "180deg";
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

if (saveSettings) {
  saveSettings.addEventListener("click", () => {
    const hours = parseInt(settingsHours?.value ?? 0) || 0;
    const minutes = parseInt(settingsMinutes?.value ?? 0) || 0;
    const seconds = parseInt(settingsSeconds?.value ?? 0) || 0;
    const increment = parseInt(settingsIncrement?.value ?? 0) || 0;
    const lowTimeAlert = parseInt(settingsLowTimeAlert?.value ?? 0) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (settingsTarget === "one") {
      playerOneBgAlertToggle = bgAlertToggle?.checked ?? playerOneBgAlertToggle;
      playerOneSoundToggle = soundToggle.checked;
      playerOneTime = totalSeconds;
      playerOneIncrement = increment;
      playerOneLowTimeAlert = lowTimeAlert;
      modeTimeOne.textContent = `${minutes} | ${increment}`;
    } else if (settingsTarget === "two") {
      playerTwoBgAlertToggle = bgAlertToggle?.checked ?? playerTwoBgAlertToggle;
      playerTwoSoundToggle = soundToggle?.checked ?? playerTwoSoundToggle;
      playerTwoTime = totalSeconds;
      playerTwoIncrement = increment;
      playerTwoLowTimeAlert = lowTimeAlert;
      modeTimeTwo.textContent = `${minutes} | ${increment}`;
    }
    console.log("playerOneSoundToggle:", playerOneSoundToggle);
    console.log("playerTwoSoundToggle:", playerTwoSoundToggle);

    updateTimer();
    modalOverlay.style.display = "none";
  });
}

function playSound(name) {
  if (!isMuted) {
    const sound = sounds[name];
    if (sound) {
      sound.currentTime = 0; // rewind so it plays from start
      sound.play();
    }
  }
}

function validateInput(input) {
  if (input.value.length > 2) {
    input.value = input.value.slice(0, 2);
  }

  if (parseInt(input.value) > 59) {
    input.value = 59;
  }
}

arrowBackBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (e.target.classList.contains("arrow-back-one")) {
      mainPage.style.display = "flex";
      timeControlPage.style.display = "none";
    } else if (e.target.classList.contains("arrow-back-two")) {
      timeControlPage.style.display = "flex";
      customTimePage.style.display = "none";
    }
  });
});

timerBtn.addEventListener("click", () => {
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "block";
  clearInterval(timer);
  mainPage.style.display = "none";
  timeControlPage.style.display = "flex";
});

modeContainer.addEventListener("click", (e) => {
  const clicked = e.target.closest(".mode");
  if (!clicked) return;

  document
    .querySelectorAll(".mode")
    .forEach((el) => el.classList.remove("active"));

  clicked.classList.add("active");
  selectedMinutes = parseInt(clicked.dataset.minutes);
  selectedIncrements = parseInt(clicked.dataset.increment);
});

startBtn.addEventListener("click", () => {
  mainPage.style.display = "flex";
  timeControlPage.style.display = "none";
  playerOneTime = selectedMinutes * 60;
  playerTwoTime = selectedMinutes * 60;
  playerOneIncrement = selectedIncrements;
  playerTwoIncrement = selectedIncrements;
  modeTimeOne.textContent = `${selectedMinutes} | ${selectedIncrements}`;
  modeTimeTwo.textContent = `${selectedMinutes} | ${selectedIncrements}`;
  playerTwoMoveCount = 0;
  playerOneMoveCount = 0;
  playerOneMoves.textContent = `Moves: ${playerOneMoveCount}`;
  playerTwoMoves.textContent = `Moves: ${playerTwoMoveCount}`;
  currentPlayer = null;
  movesSwitch = false;
  playerOne.classList.remove("active-turn-bg");
  playerTwo.classList.remove("active-turn-bg");

  document
    .querySelectorAll(".mode")
    .forEach((el) => el.classList.remove("active"));

  updateTimer();
});

customTimeBtn.addEventListener("click", () => {
  timeControlPage.style.display = "none";
  customTimePage.style.display = "block";
});

customSaveBtn?.addEventListener("click", async () => {
  const mins = parseInt(customMinutes?.value ?? 0) || 0;
  const inc = parseInt(customIncrements?.value ?? 0) || 0;

  const user = firebase.auth().currentUser;
  customSaveBtn.disabled = true;
  customSaveBtn.textContent = "Saving...";
  if (user) {
    try {
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .collection("customTimes")
        .add({
          minutes: mins,
          increment: inc,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      alert("Failed to save custom time: " + error.message);
    } finally {
      customSaveBtn.disabled = false;
      customSaveBtn.textContent = "Save";
    }
  }

  const newMode = document.createElement("div");
  newMode.classList.add("mode");
  newMode.setAttribute("data-minutes", String(mins));
  newMode.setAttribute("data-increment", String(inc));
  newMode.textContent = `${mins} min | ${inc} sec`;
  modeContainer.appendChild(newMode);
  customTimePage.style.display = "none";
  timeControlPage.style.display = "flex";
});

profileBtn.addEventListener("click", () => {
  if (profileContainer.style.display == "block") {
    profileContainer.style.display = "none";
  } else {
    profileContainer.style.display = "block";
  }
});

showSignupPage.addEventListener("click", () => {
  loginPage.style.display = "none";
  signupPage.style.display = "block";
});

showLoginPage.addEventListener("click", () => {
  loginPage.style.display = "block";
  signupPage.style.display = "none";
});

signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  signupBtn.disabled = true;
  signupBtn.textContent = "Signing Up...";

  signup(signupEmail.value, signupPassword.value, signupUsername.value)
    .then((userCredential) => {
      alert("Signup Successful!");
      mainPage.style.display = "flex";
      signupPage.style.display = "none";
    })
    .catch((error) => {
      alert("Signup failed: " + error.message);
    })
    .finally(() => {
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign Up";
    });
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const pass = loginPassword.value;
  if (!email || !pass) {
    alert("Enter email and password.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  login(email, pass)
    .then(async (userCredential) => {
      const uid = userCredential.user.uid;
      const userDoc = await firebase.firestore().doc(`users/${uid}`).get();

      if (!userDoc.exists) {
        await firebase.auth().signOut();
        alert("Account not fully registered. Please sign up first.");
        loginPage.style.display = "none";
        signupPage.style.display = "block";
        return;
      }
      //Success: show Main Page
      loginPage.style.display = "none";
      signupPage.style.display = "none";
      mainPage.style.display = "flex";
    })
    .catch((error) => {
      switch (error.code) {
        case "auth/user-not-found":
          alert("No account found. Please sign up.");
          loginPage.style.display = "none";
          signupPage.style.display = "block";
          break;
        case "auth/wrong-password":
          alert("Incorrect password.");
          break;
        case "auth/too-many-requests":
          alert("Too many attempts. Try again later.");
          break;
        default:
          alert("Login failed: " + error.message);
      }
    })
    .finally(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    });
});

function showLowTimeAlert(time, bgAlertToggle, lowTimeAlert) {
  return time > 0 && bgAlertToggle && time <= lowTimeAlert;
}

function setActiveTurnBg(turn) {
  playerOne.classList.toggle("active-turn-bg", turn === "one");
  playerTwo.classList.toggle("active-turn-bg", turn === "two");
}

// Registering the service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js") // Add leading slash
      .then(() => {
        console.log("Service Worker registered successfully");
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
