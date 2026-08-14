const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const turnIndicator = document.getElementById('turn-indicator');
const restartBtn = document.getElementById('restart-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function checkWinner() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

function isDraw() {
  return board.every((cell) => cell !== null);
}

function handleCellClick(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (gameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  event.currentTarget.textContent = currentPlayer;
  event.currentTarget.classList.add(currentPlayer.toLowerCase());
  event.currentTarget.disabled = true;

  const result = checkWinner();

  if (result) {
    gameOver = true;
    highlightWin(result.line);
    statusEl.textContent = `Jogador ${result.player} venceu!`;
    scores[result.player]++;
    updateScoreboard();
    disableBoard();
    return;
  }

  if (isDraw()) {
    gameOver = true;
    statusEl.textContent = 'Empate!';
    scores.draw++;
    updateScoreboard();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  turnIndicator.textContent = currentPlayer;
  statusEl.innerHTML = `Vez de: <span id="turn-indicator">${currentPlayer}</span>`;
}

function highlightWin(line) {
  line.forEach((index) => cells[index].classList.add('win'));
}

function disableBoard() {
  cells.forEach((cell) => (cell.disabled = true));
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDrawEl.textContent = scores.draw;
}

function restartGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;

  cells.forEach((cell) => {
    cell.textContent = '';
    cell.disabled = false;
    cell.classList.remove('x', 'o', 'win');
  });

  statusEl.innerHTML = `Vez de: <span id="turn-indicator">X</span>`;
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
}

cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScores);
