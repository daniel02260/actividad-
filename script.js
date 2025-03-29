const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

let score = 0;
let gameOver = false;

const pieces = [
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
];

const player = {
  pos: { x: 4, y: 0 },
  matrix: randomPiece(),
};

const arena = createMatrix(12, 20);

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function randomPiece() {
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  return player.matrix.some((row, y) =>
    row.some((value, x) =>
      value !== 0 && (arena[y + player.pos.y]?.[x + player.pos.x] ?? 1) !== 0
    )
  );
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerReset() {
  player.matrix = randomPiece();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    endGame();
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function arenaSweep() {
  let rowCount = 1;
  for (let y = arena.length - 1; y >= 0; --y) {
    if (arena[y].every(cell => cell !== 0)) {
      arena.splice(y, 1);
      arena.unshift(new Array(arena[0].length).fill(0));
      score += rowCount * 10;
      rowCount *= 2;
    }
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  if (gameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerText = score;
}

function endGame() {
  gameOver = true;
  document.getElementById('game-over').style.display = 'block';
}

function startGame() {
  arena.forEach(row => row.fill(0));
  score = 0;
  gameOver = false;
  document.getElementById('game-over').style.display = 'none';
  playerReset();
  updateScore();
  update();
}

document.getElementById('left').addEventListener('click', () => playerMove(-1));
document.getElementById('right').addEventListener('click', () => playerMove(1));
document.getElementById('down').addEventListener('click', playerDrop);

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
});

startGame();
