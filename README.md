# Chessing (Standalone Browser Build)

This branch remakes Chessing as a **download-and-run** chess platform that starts by opening `index.html` directly in any modern browser.

## Run

1. Download or clone this folder.
2. Double-click `index.html`.

No build step, server, or install is required.

## Included systems

- Dual ratings: **Standard Elo** + **HCF competitive rating**
- Functional chess board (legal move enforcement, move list, flip board, promotion to queen)
- Queue modes (casual / Elo / HCF / bot)
- Local bot play with timing + evaluation search
- Puzzle module with real FEN positions, hint, retry, survival lives, and puzzle rating updates
- Analysis studio with FEN load, top-3 local engine lines, evaluation, and PGN export
- Profile with performance metrics
- Standard + HCF leaderboards
- HCF competitive hub
- Persistent local storage for profile, ratings, and game history

## Architecture

- `index.html` – shell and navigation
- `standalone/styles.css` – UI system and responsive design
- `standalone/app.js` – all app logic and state
- `standalone/vendor/chess.js` – local chess rules engine (no CDN)

## Notes

This standalone build is designed for offline browser execution without backend infrastructure.
