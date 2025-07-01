const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    startScreen: document.querySelector("#start-screen"),
    gameOverScreen: document.querySelector("#game-over-screen"),
    finalScore: document.querySelector("#final-score"),
    startBtn: document.querySelector("#start-btn"),
    restartBtn: document.querySelector("#restart-btn"),
    howToBtn: document.querySelector("#how-to-btn"),
    backBtn: document.querySelector("#back-btn"),
    menuBtn: document.querySelector("#menu-btn")
  },
  values: {
    gameVelocity: 1000,
    hitPosition: 0,
    result: 0,
    curretTime: 60,
    lastPosition: null,
    hitCooldown: false,
    cooldownDuration: 800
  },
  actions: {
    timerId: null,
    countDownTimerId: null
  }
};

function countDown() {
  state.values.curretTime--;
  state.view.timeLeft.textContent = state.values.curretTime;

  if (state.values.curretTime <= 0) {
    endGame();
  }
}

function playSound(audioName) {
  const sounds = {
    hit: "/src/audio/hit.m4a",
    miss: "/src/audio/hiterror.m4a"
  };

  try {
    const audio = new Audio(sounds[audioName]);
    audio.volume = audioName === "hit" ? 0.3 : 0.2;
    audio.play().catch(e => console.log("Erro no som:", e));
  } catch (e) {
    console.log("Erro ao carregar som:", e);
  }
}

function randomSquare() {
  if (state.values.hitCooldown) return;

  let availableSquares = Array.from(state.view.squares);

  if (state.values.lastPosition !== null) {
    availableSquares = availableSquares.filter(
      square => square.id !== state.values.lastPosition
    );
  }

  if (availableSquares.length === 0) {
    availableSquares = Array.from(state.view.squares);
  }

  const randomIndex = Math.floor(Math.random() * availableSquares.length);
  const selectedSquare = availableSquares[randomIndex];

  state.view.squares.forEach(square => {
    square.classList.remove("enemy");
  });

  selectedSquare.classList.add("enemy");
  state.values.hitPosition = selectedSquare.id;
  state.values.lastPosition = selectedSquare.id;
}

function addListenerHitBox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => {
      if (square.id === state.values.hitPosition) {
        square.classList.remove("enemy");
        
        const explosion = document.createElement("div");
        explosion.className = "hit-effect";
        
        square.style.position = "relative";
        square.style.overflow = "hidden";
        explosion.style.position = "absolute";
        explosion.style.top = "0";
        explosion.style.left = "0";
        explosion.style.width = "100%";
        explosion.style.height = "100%";
        
        square.appendChild(explosion);

        setTimeout(() => {
          explosion.remove();
          square.style.position = "";
        }, 300);

       
        state.values.hitCooldown = true;
        setTimeout(() => {
          state.values.hitCooldown = false;
        }, state.values.cooldownDuration);

    
        state.values.result++;
        state.view.score.textContent = state.values.result;
        state.values.hitPosition = null;
        playSound("hit");
      } else {
      
        square.classList.add("miss");
        setTimeout(() => square.classList.remove("miss"), 300);
        
        if (state.values.result > 0) {
          state.values.result--;
          state.view.score.textContent = state.values.result;
        }
        playSound("miss");
      }
    });
  });
}

function startGame() {
  clearInterval(state.actions.timerId);
  clearInterval(state.actions.countDownTimerId);
  state.view.squares.forEach(sq => {
    sq.classList.remove("enemy", "miss");
    sq.style.position = "";
  });

  state.view.startScreen.classList.add("hidden");
  state.values.curretTime = 60;
  state.values.result = 0;
  state.values.lastPosition = null;
  state.values.hitCooldown = false;
  state.view.score.textContent = "0";
  state.view.timeLeft.textContent = "60";

  let count = 3;
  const countdownEl = document.createElement("div");
  countdownEl.style.cssText = `
    position: fixed; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%); 
    font-size: 5rem; 
    color: #FFD700;
    text-shadow: 4px 4px 0 #FF0000;
    z-index: 200;
  `;
  document.body.appendChild(countdownEl);
  
  const timer = setInterval(() => {
    countdownEl.textContent = count > 0 ? count : "GO!";
    count--;
    if (count < -1) {
      clearInterval(timer);
      countdownEl.remove();
      state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
      state.actions.countDownTimerId = setInterval(countDown, 1000);
    }
  }, 1000);
}

function endGame() {
  clearInterval(state.actions.countDownTimerId);
  clearInterval(state.actions.timerId);
  state.view.finalScore.textContent = state.values.result;
  state.view.gameOverScreen.classList.remove("hidden");
}

function initialize() {
  state.view.startBtn.addEventListener("click", startGame);
  state.view.restartBtn.addEventListener("click", () => {
    state.view.gameOverScreen.classList.add("hidden");
    startGame();
  });
  state.view.menuBtn.addEventListener("click", () => {
    state.view.gameOverScreen.classList.add("hidden");
    state.view.startScreen.classList.remove("hidden");
  });
  state.view.howToBtn.addEventListener("click", () => {
    state.view.startScreen.classList.add("hidden");
    document.querySelector("#how-to-screen").classList.remove("hidden");
  });
  state.view.backBtn.addEventListener("click", () => {
    document.querySelector("#how-to-screen").classList.add("hidden");
    state.view.startScreen.classList.remove("hidden");
  });

  addListenerHitBox();
}

initialize();