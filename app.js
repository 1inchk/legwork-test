(function () {
  const { getWinner, isDraw, bestMove } = window.TicTacToe;

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const scoreEls = {
    X: document.getElementById("score-X"),
    O: document.getElementById("score-O"),
    draw: document.getElementById("score-draw"),
  };

  const HUMAN = "X";
  const AI = "O";
  const score = { X: 0, O: 0, draw: 0 };
  let board, current, over;

  const mode = () => document.querySelector('input[name="mode"]:checked').value;

  const cells = Array.from({ length: 9 }, (_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell";
    btn.dataset.index = i;
    btn.addEventListener("click", () => play(i));
    btn.addEventListener("keydown", onArrow);
    boardEl.appendChild(btn);
    return btn;
  });

  // Arrow keys move focus around the grid.
  function onArrow(e) {
    const i = Number(e.currentTarget.dataset.index);
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = i + moves[e.key];
    if (next < 0 || next > 8) return;
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && Math.floor(next / 3) !== Math.floor(i / 3)) return;
    cells[next].focus();
  }

  function cellLabel(i) {
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;
    return `Row ${row}, column ${col}: ${board[i] || "empty"}`;
  }

  function render(winLine = []) {
    cells.forEach((btn, i) => {
      btn.textContent = board[i] || "";
      btn.className = "cell" + (board[i] ? " " + board[i].toLowerCase() : "") + (winLine.includes(i) ? " win" : "");
      // aria-disabled (not disabled) keeps filled cells focusable for arrow-key navigation.
      btn.setAttribute("aria-disabled", String(over || Boolean(board[i]) || (mode() === "ai" && current === AI)));
      btn.setAttribute("aria-label", cellLabel(i));
    });
    Object.keys(score).forEach((k) => { scoreEls[k].textContent = score[k]; });
  }

  function turnText() {
    if (mode() === "ai") return current === HUMAN ? "Your turn (X)" : "Computer is thinking…";
    return `Player ${current}'s turn`;
  }

  function finishIfOver() {
    const win = getWinner(board);
    if (win) {
      over = true;
      score[win.player]++;
      statusEl.textContent = mode() === "ai"
        ? (win.player === HUMAN ? "You win!" : "Computer wins.")
        : `Player ${win.player} wins!`;
      render(win.line);
      return true;
    }
    if (isDraw(board)) {
      over = true;
      score.draw++;
      statusEl.textContent = "It's a draw.";
      render();
      return true;
    }
    return false;
  }

  function play(i) {
    if (over || board[i]) return;
    if (mode() === "ai" && current === AI) return;
    move(i);
    if (!over && mode() === "ai" && current === AI) {
      setTimeout(() => {
        move(bestMove(board, AI));
        const firstEmpty = cells.find((c) => c.getAttribute("aria-disabled") === "false");
        if (firstEmpty && !boardEl.contains(document.activeElement)) firstEmpty.focus();
      }, 350);
    }
  }

  function move(i) {
    board[i] = current;
    if (finishIfOver()) return;
    current = current === "X" ? "O" : "X";
    statusEl.textContent = turnText();
    render();
  }

  function newGame() {
    board = Array(9).fill(null);
    current = "X";
    over = false;
    statusEl.textContent = turnText();
    render();
  }

  document.getElementById("restart").addEventListener("click", newGame);
  document.getElementById("reset-score").addEventListener("click", () => {
    score.X = score.O = score.draw = 0;
    newGame();
  });
  document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", newGame));

  newGame();
})();
