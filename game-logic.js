(function exposeLogic(global) {
  const WORLD = Object.freeze({
    width: 480, height: 720, birdX: 132, birdRadius: 15, gravity: 1450, flapVelocity: -440,
    pipeWidth: 74, pipeGap: 176, minPipeGap: 136, pipeSpeed: 190, maxPipeSpeed: 250,
    groundHeight: 92, spawnEvery: 1.45, minSpawnEvery: 1.22
  });

  function newGame(best = 0) { return { phase: 'ready', birdY: 330, velocity: 0, pipes: [], score: 0, best, spawnTimer: 0, elapsed: 0 }; }
  function difficultyForScore(score) { return { pipeSpeed: Math.min(WORLD.maxPipeSpeed, WORLD.pipeSpeed + score * 4), pipeGap: Math.max(WORLD.minPipeGap, WORLD.pipeGap - score * 2), spawnEvery: Math.max(WORLD.minSpawnEvery, WORLD.spawnEvery - score * 0.015) }; }
  function flap(state) { if (state.phase === 'gameover') return state; return { ...state, phase: 'playing', velocity: WORLD.flapVelocity }; }
  function restart(state) { return newGame(state.best); }
  function applyAction(state, action) { if (action === 'flap') return flap(state); if (action === 'restart' || action === 'title') return restart(state); return state; }
  function collides(state) {
    const bird = { left: WORLD.birdX - WORLD.birdRadius, right: WORLD.birdX + WORLD.birdRadius, top: state.birdY - WORLD.birdRadius, bottom: state.birdY + WORLD.birdRadius };
    if (bird.top < 0 || bird.bottom > WORLD.height - WORLD.groundHeight) return true;
    return state.pipes.some((pipe) => { const overlapsX = bird.right > pipe.x && bird.left < pipe.x + WORLD.pipeWidth; const overlapsY = bird.top < pipe.gapTop || bird.bottom > pipe.gapTop + pipe.gap; return overlapsX && overlapsY; });
  }
  function tick(previous, dt, random = Math.random) {
    if (previous.phase !== 'playing') return previous;
    const state = { ...previous, pipes: previous.pipes.map((pipe) => ({ ...pipe })), elapsed: previous.elapsed + dt };
    const difficulty = difficultyForScore(state.score); state.velocity += WORLD.gravity * dt; state.birdY += state.velocity * dt; state.spawnTimer += dt;
    while (state.spawnTimer >= difficulty.spawnEvery) { state.spawnTimer -= difficulty.spawnEvery; const minTop = 86; const maxTop = WORLD.height - WORLD.groundHeight - difficulty.pipeGap - 86; state.pipes.push({ x: WORLD.width + 24, gapTop: minTop + random() * (maxTop - minTop), gap: difficulty.pipeGap, scored: false }); }
    state.pipes.forEach((pipe) => { pipe.x -= difficulty.pipeSpeed * dt; }); state.pipes = state.pipes.filter((pipe) => pipe.x > -WORLD.pipeWidth - 4);
    state.pipes.forEach((pipe) => { if (!pipe.scored && pipe.x + WORLD.pipeWidth < WORLD.birdX) { pipe.scored = true; state.score += 1; } });
    if (collides(state)) return { ...state, phase: 'gameover', best: Math.max(state.best, state.score) }; return state;
  }
  function inputAction(code, phase) { if (code === 'ArrowUp' || code === 'Space') return phase === 'gameover' ? 'restart' : 'flap'; if (code === 'KeyR' && phase === 'gameover') return 'restart'; if (code === 'Escape') return 'title'; return null; }

  global.FlappyAsimLogic = Object.freeze({ WORLD, newGame, difficultyForScore, flap, restart, applyAction, collides, tick, inputAction });
})(typeof window === 'undefined' ? globalThis : window);
