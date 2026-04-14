# Chessing — Standalone Browser Platform

Chessing now runs by downloading the folder and opening `index.html` directly.

## Quick start
1. Download this repository folder.
2. Open `index.html` in a modern browser.
3. Create an account in the built-in auth gate, then explore play, puzzles, bots, analysis, HCF hub, profile, and settings.

## What is implemented
- Login/signup gate before accessing the full platform.
- Dual rating ladders: **Standard Elo** and **HCF** with dedicated HCF hub and queue.
- True 8x8 responsive board with exact square aspect ratio at all sizes.
- Themeable piece rendering (Neo Rounded, Clean, Classic, Modern, Premium).
- Personalization system (board theme, piece theme, sound, animation mode, coords, highlight/arrow colors, dark/light mode, profile fields, preferred controls).
- Puzzle system with real FEN positions, themes, rating gains/losses, hint/retry/next, streak and rush counters.
- Bots with multiple strengths and personalities.
- Analysis workspace with Stockfish worker integration (`standalone/vendor/stockfish.js`), multipv lines, live depth stream, FEN load, and PGN copy.
- Leaderboards, profile history, and persisted local state via `localStorage`.

## Architecture
- `index.html` – shell and page containers.
- `standalone/styles.css` – full responsive design system.
- `standalone/app.js` – auth, state, board logic, modes, settings, profiles, puzzles, analysis.
- `standalone/vendor/chess.js` – legal move engine.
- `standalone/vendor/stockfish.js` – Stockfish worker script for deeper analysis.
