# flappy-asim

A small, original Canvas game inspired by the classic one-button arcade format. It is self-contained and Windows-friendly: no install or build step is required.

## Install and run on Windows

### Prerequisites

- Windows 10 or newer.
- Microsoft Edge, Google Chrome, or Mozilla Firefox.
- No game engine, package manager, or build tool is required.
- Node.js 18+ is optional and is only needed to run the automated tests.

### Get the game

Download the repository from GitHub with **Code → Download ZIP** and extract it, or clone it from PowerShell:

```powershell
git clone https://github.com/Asimarif11/flappy-asim.git
cd flappy-asim
```

### Open directly

Open the extracted folder and double-click `index.html`. Windows will open it in the default browser. You can also right-click the file and choose **Open with** to select Edge, Chrome, or Firefox.

### Run with a local server

The direct file option is enough for play. A local server is useful for browser developer tools and the most consistent module-loading behavior. From PowerShell in the repository folder, choose either option:

With Python installed:

   ```powershell
   py -m http.server 8000
   ```

With Node.js installed:

   ```powershell
   npx --yes serve .
   ```

Visit <http://localhost:8000> for the Python server, or the URL printed by `serve` for the Node.js server. Stop either server with `Ctrl+C`.

## Controls

- **Up Arrow** (primary Windows keyboard control), **Space**, or **click/tap**: flap / start
- **R** or **click/tap** after a crash: restart
- **Esc**: return to the title screen

The best score is saved in the browser on this computer. The game is responsive and works with keyboard, mouse, and touch.

## Test locally

Install Node.js 18 or newer if it is not already installed, then open PowerShell in the repository folder and run:

```powershell
npm test
```

This uses Node's built-in test runner and exercises deterministic physics, scoring, collision, game-over, restart input, and the Up Arrow/Space controls without needing a browser dependency. A successful run reports 5 passing tests.
