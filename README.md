# flappy-asim

A small, original Canvas game inspired by the classic one-button arcade format. It is self-contained and Windows-friendly: no install or build step is required.

## Run on Windows

1. Download or clone this repository.
2. Double-click `index.html` to play, or right-click it and choose a browser. For the most reliable local experience, open PowerShell in this folder and run:

   ```powershell
   py -m http.server 8000
   ```

3. Visit <http://localhost:8000> in Edge, Chrome, or Firefox. Stop the server with `Ctrl+C`.

## Controls

- **Up Arrow** (primary), **Space**, or **click/tap**: flap / start
- **R** or **click/tap** after a crash: restart
- **Esc**: return to the title screen

The best score is saved in the browser on this computer. The game is responsive and works with keyboard, mouse, and touch.

## Test

With Node.js 18+ installed, run:

```powershell
npm test
```

This exercises the deterministic physics, scoring, collision, restart, and input behavior without needing a browser dependency.
