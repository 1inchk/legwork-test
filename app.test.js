// Regression tests for the UI controller (app.js), run against a minimal fake DOM
// and a manual clock so the computer's delayed move can be controlled.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const TicTacToe = require("./game.js");

const APP_SOURCE = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

function fakeElement(extra = {}) {
  const handlers = {};
  const attrs = {};
  const children = [];
  return {
    textContent: "",
    className: "",
    dataset: {},
    children,
    ...extra,
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return k in attrs ? attrs[k] : null; },
    addEventListener(type, fn) { (handlers[type] ||= []).push(fn); },
    dispatch(type, event = {}) {
      (handlers[type] || []).forEach((fn) => fn({ currentTarget: this, preventDefault() {}, ...event }));
    },
    appendChild(child) { children.push(child); return child; },
    contains(el) { return children.includes(el); },
    focus() {},
  };
}

// Boots app.js in a sandbox. Returns helpers to click, switch mode and run timers.
function boot({ ignoreClear = false } = {}) {
  const ids = {};
  ["board", "status", "score-X", "score-O", "score-draw", "restart", "reset-score"]
    .forEach((id) => { ids[id] = fakeElement(); });
  const radios = [fakeElement({ value: "ai", checked: true }), fakeElement({ value: "pvp", checked: false })];

  const document = {
    activeElement: null,
    getElementById: (id) => ids[id],
    createElement: () => fakeElement(),
    querySelector: () => radios.find((r) => r.checked),
    querySelectorAll: () => radios,
  };

  let nextId = 1;
  const timers = new Map();
  const context = {
    window: { TicTacToe },
    document,
    setTimeout: (fn) => { const id = nextId++; timers.set(id, fn); return id; },
    clearTimeout: (id) => { if (!ignoreClear) timers.delete(id); },
  };
  vm.runInNewContext(APP_SOURCE, context);

  const cells = ids.board.children;
  return {
    cells,
    status: ids.status,
    board: () => cells.map((c) => c.textContent),
    click: (i) => cells[i].dispatch("click"),
    restart: () => ids.restart.dispatch("click"),
    resetScore: () => ids["reset-score"].dispatch("click"),
    setMode: (value) => {
      radios.forEach((r) => { r.checked = r.value === value; });
      radios.find((r) => r.value === value).dispatch("change");
    },
    pendingTimers: () => timers.size,
    runTimers: () => { const fns = [...timers.values()]; timers.clear(); fns.forEach((fn) => fn()); },
  };
}

const EMPTY = Array(9).fill("");

test("computer replies after its delay on a normal turn", () => {
  const app = boot();
  app.click(0);
  assert.equal(app.pendingTimers(), 1);
  assert.equal(app.board().filter((v) => v === "O").length, 0);
  app.runTimers();
  assert.equal(app.board().filter((v) => v === "O").length, 1);
  assert.equal(app.status.textContent, "Your turn (X)");
});

test("restart cancels a pending computer move", () => {
  const app = boot();
  app.click(0);
  app.restart();
  assert.equal(app.pendingTimers(), 0);
  app.runTimers();
  assert.deepEqual(app.board(), EMPTY);
  assert.equal(app.status.textContent, "Your turn (X)");
});

test("reset score cancels a pending computer move", () => {
  const app = boot();
  app.click(4);
  app.resetScore();
  app.runTimers();
  assert.deepEqual(app.board(), EMPTY);
});

test("switching to 2 players cancels a pending computer move", () => {
  const app = boot();
  app.click(0);
  app.setMode("pvp");
  app.runTimers();
  assert.deepEqual(app.board(), EMPTY);
  assert.equal(app.status.textContent, "Player X's turn");
});

test("a stale callback does nothing if it still fires", () => {
  // clearTimeout is a no-op here, so the old callback really fires.
  const app = boot({ ignoreClear: true });
  app.click(0);
  app.setMode("pvp");
  app.click(4); // X plays in the new 2-player game; it is now O's (human) turn
  assert.equal(app.pendingTimers(), 1);
  app.runTimers();
  assert.deepEqual(app.board(), ["", "", "", "", "X", "", "", "", ""]);
});
