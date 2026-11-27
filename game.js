// Pure tic tac toe logic. Works in the browser (window.TicTacToe) and Node (require).
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TicTacToe = api;
})(typeof self !== "undefined" ? self : this, function () {
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  /** Returns { player, line } for a winner, or null. */
  function getWinner(board) {
    for (const line of LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { player: board[a], line };
      }
    }
    return null;
  }

  function isDraw(board) {
    return !getWinner(board) && board.every(Boolean);
  }

  function emptyCells(board) {
    const cells = [];
    board.forEach((v, i) => { if (!v) cells.push(i); });
    return cells;
  }

  function other(player) {
    return player === "X" ? "O" : "X";
  }

  // Minimax with depth so the AI prefers faster wins and slower losses.
  function minimax(board, toMove, me, depth) {
    const win = getWinner(board);
    if (win) return win.player === me ? 10 - depth : depth - 10;
    if (board.every(Boolean)) return 0;
    const scores = emptyCells(board).map((i) => {
      board[i] = toMove;
      const s = minimax(board, other(toMove), me, depth + 1);
      board[i] = null;
      return s;
    });
    return toMove === me ? Math.max(...scores) : Math.min(...scores);
  }

  /** Best cell index for `player` to play, or -1 if the game is over. */
  function bestMove(board, player) {
    if (getWinner(board)) return -1;
    const copy = board.slice();
    let best = -1;
    let bestScore = -Infinity;
    for (const i of emptyCells(copy)) {
      copy[i] = player;
      const s = minimax(copy, other(player), player, 1);
      copy[i] = null;
      if (s > bestScore) { bestScore = s; best = i; }
    }
    return best;
  }

  return { LINES, getWinner, isDraw, emptyCells, bestMove, other };
});
