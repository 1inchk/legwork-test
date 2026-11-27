const test = require("node:test");
const assert = require("node:assert/strict");
const { getWinner, isDraw, bestMove } = require("./game.js");

const b = (s) => s.split("").map((c) => (c === "." ? null : c));

test("detects row, column and diagonal wins", () => {
  assert.deepEqual(getWinner(b("XXX......")), { player: "X", line: [0, 1, 2] });
  assert.deepEqual(getWinner(b("O..O..O..")), { player: "O", line: [0, 3, 6] });
  assert.deepEqual(getWinner(b("..X.X.X..")), { player: "X", line: [2, 4, 6] });
  assert.equal(getWinner(b("XO.......")), null);
});

test("detects a draw only on a full board with no winner", () => {
  assert.equal(isDraw(b("XOXXOOOXX")), true);
  assert.equal(isDraw(b("XOXXOOOX.")), false);
  assert.equal(isDraw(b("XXXOO.O..")), false);
});

test("AI takes a winning move", () => {
  assert.equal(bestMove(b("OO.XX...."), "O"), 2);
});

test("AI blocks the opponent's winning move", () => {
  assert.equal(bestMove(b("XX..O...."), "O"), 2);
});

test("AI never loses against itself (always a draw)", () => {
  const board = Array(9).fill(null);
  let player = "X";
  while (!getWinner(board) && !isDraw(board)) {
    board[bestMove(board, player)] = player;
    player = player === "X" ? "O" : "X";
  }
  assert.equal(isDraw(board), true);
});

test("bestMove returns -1 once the game is won", () => {
  assert.equal(bestMove(b("XXXOO...."), "O"), -1);
});
