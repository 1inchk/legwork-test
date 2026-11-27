# Tic Tac Toe

A dependency-free tic tac toe game for the browser.

- **vs Computer**: you play X; the computer plays O with an unbeatable minimax AI.
- **2 Players**: take turns on the same device.
- Score tracking, keyboard play (Tab / arrow keys, Enter or Space to place), screen-reader status announcements.

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then visit <http://localhost:8000>.

## Test

The game logic lives in `game.js` and is tested with Node's built-in runner (Node 18+):

```bash
node --test
```
