const board = document.getElementById("board");
const levelText = document.getElementById("levelText");
const movesText = document.getElementById("movesText");
const message = document.getElementById("message");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const messageRestart = document.getElementById("messageRestart");
const levelsBtn = document.getElementById("levelsBtn");
const closeLevels = document.getElementById("closeLevels");
const levelPanel = document.getElementById("levelPanel");
const levelGrid = document.getElementById("levelGrid");

const TOTAL_LEVELS = levels.length;
let currentLevel = Number(localStorage.getItem("snakeCurrentLevel") || 1);
let unlocked = Number(localStorage.getItem("snakeUnlockedLevel") || 1);
let completed = JSON.parse(localStorage.getItem("snakeCompleted") || "[]");

let snake = [];
let target = null;
let wallSet = new Set();
let moves = 0;
let gameOver = false;

function key(r, c) {
  return `${r},${c}`;
}

function validCell(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function loadLevel(number) {
  currentLevel = Math.max(1, Math.min(TOTAL_LEVELS, number));
  const data = levels[currentLevel - 1];

  snake = [data.start.slice()];
  target = data.target.slice();
  wallSet = new Set(data.walls.map(([r, c]) => key(r, c)));
  moves = 0;
  gameOver = false;

  localStorage.setItem("snakeCurrentLevel", currentLevel);
  render();
  closeMessage();
  renderLevelButtons();
}

function render() {
  board.innerHTML = "";

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const k = key(r, c);
      if (wallSet.has(k)) cell.classList.add("wall");

      if (snake.some(([sr, sc]) => sr === r && sc === c)) {
        cell.classList.add("snake");
      }

      if (target[0] === r && target[1] === c) {
        cell.classList.add("target");
      }

      board.appendChild(cell);
    }
  }

  levelText.textContent = currentLevel;
  movesText.textContent = moves;
}

function move(dir) {
  if (gameOver) return;

  const [r, c] = snake[0];
  const delta = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
  }[dir];

  if (!delta) return;

  const nr = r + delta[0];
  const nc = c + delta[1];

  // The board edge behaves like a wall.
  if (!validCell(nr, nc) || wallSet.has(key(nr, nc))) {
    flashBoard();
    return;
  }

  // This game uses a compact snake body. The body grows after each target.
  if (snake.some(([sr, sc]) => sr === nr && sc === nc)) {
    flashBoard();
    return;
  }

  snake.unshift([nr, nc]);
  moves++;

  if (nr === target[0] && nc === target[1]) {
    completeLevel();
    return;
  }

  // Keep the classic snake feel while still making the maze puzzle readable.
  // Before reaching the target the body stays short; every 4 moves it grows.
  const maxLength = Math.min(7, 1 + Math.floor(moves / 4));
  while (snake.length > maxLength) snake.pop();

  render();
}

function completeLevel() {
  gameOver = true;

  if (!completed.includes(currentLevel)) {
    completed.push(currentLevel);
    localStorage.setItem("snakeCompleted", JSON.stringify(completed));
  }

  if (currentLevel < TOTAL_LEVELS) {
    unlocked = Math.max(unlocked, currentLevel + 1);
    localStorage.setItem("snakeUnlockedLevel", unlocked);
    messageTitle.textContent = `Level ${currentLevel} Complete!`;
    messageText.textContent = `You reached the target in ${moves} moves.`;
    nextBtn.textContent = `Level ${currentLevel + 1} →`;
  } else {
    messageTitle.textContent = "🎉 All 25 Levels Complete!";
    messageText.textContent = `Amazing! You completed all ${TOTAL_LEVELS} levels.`;
    nextBtn.textContent = "Play Level 1";
  }

  message.classList.remove("hidden");
  renderLevelButtons();
}

function nextLevel() {
  if (currentLevel >= TOTAL_LEVELS) {
    loadLevel(1);
  } else {
    loadLevel(currentLevel + 1);
  }
}

function restart() {
  loadLevel(currentLevel);
}

function flashBoard() {
  board.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 140 }
  );
}

function closeMessage() {
  message.classList.add("hidden");
}

function renderLevelButtons() {
  levelGrid.innerHTML = "";

  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const btn = document.createElement("button");
    btn.className = "level-btn";
    btn.textContent = i;

    if (i === currentLevel) btn.classList.add("current");
    if (completed.includes(i)) btn.classList.add("completed");

    if (i > unlocked) {
      btn.classList.add("locked");
      btn.textContent = "🔒 " + i;
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => {
        loadLevel(i);
        levelPanel.classList.add("hidden");
      });
    }

    levelGrid.appendChild(btn);
  }
}

document.addEventListener("keydown", (event) => {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right"
  };

  if (map[event.key]) {
    event.preventDefault();
    move(map[event.key]);
  }

  if (event.key === "r" || event.key === "R") restart();
});

document.querySelectorAll(".control").forEach(btn => {
  btn.addEventListener("click", () => move(btn.dataset.dir));
});

restartBtn.addEventListener("click", restart);
messageRestart.addEventListener("click", restart);
nextBtn.addEventListener("click", nextLevel);

levelsBtn.addEventListener("click", () => {
  renderLevelButtons();
  levelPanel.classList.toggle("hidden");
});

closeLevels.addEventListener("click", () => {
  levelPanel.classList.add("hidden");
});

loadLevel(currentLevel);
