export const WORLD = Object.freeze({ width: 480, height: 720, birdX: 132, birdRadius: 15, gravity: 1450, flapVelocity: -440, pipeWidth: 74, pipeGap: 176, pipeSpeed: 190, groundHeight: 92, spawnEvery: 1.45 });

export function newGame(best = 0) { return { phase: 'ready', birdY: 330, velocity: 0, pipes: [], score: 0, best, spawnTimer: 0, elapsed: 0 }; }
export function flap(state) { if (state.phase === 'gameover') return state; return { ...state, phase: 'playing', velocity: WORLD.flapVelocity }; }
export function collides(state) {
  const bird = { left: WORLD.birdX - WORLD.birdRadius, right: WORLD.birdX + WORLD.birdRadius, top: state.birdY - WORLD.birdRadius, bottom: state.birdY + WORLD.birdRadius };
  if (bird.top < 0 || bird.bottom > WORLD.height - WORLD.groundHeight) return true;
  return state.pipes.some((pipe) => { const overlapsX = bird.right > pipe.x && bird.left < pipe.x + WORLD.pipeWidth; const overlapsY = bird.top < pipe.gapTop || bird.bottom > pipe.gapTop + WORLD.pipeGap; return overlapsX && overlapsY; });
}
export function tick(previous, dt, random = Math.random) {
  if (previous.phase !== 'playing') return previous;
  const state = { ...previous, pipes: previous.pipes.map((pipe) => ({ ...pipe })), elapsed: previous.elapsed + dt };
  state.velocity += WORLD.gravity * dt; state.birdY += state.velocity * dt; state.spawnTimer += dt;
  while (state.spawnTimer >= WORLD.spawnEvery) { state.spawnTimer -= WORLD.spawnEvery; const minTop = 86; const maxTop = WORLD.height - WORLD.groundHeight - WORLD.pipeGap - 86; state.pipes.push({ x: WORLD.width + 24, gapTop: minTop + random() * (maxTop - minTop), scored: false }); }
  state.pipes.forEach((pipe) => { pipe.x -= WORLD.pipeSpeed * dt; }); state.pipes = state.pipes.filter((pipe) => pipe.x > -WORLD.pipeWidth - 4);
  state.pipes.forEach((pipe) => { if (!pipe.scored && pipe.x + WORLD.pipeWidth < WORLD.birdX) { pipe.scored = true; state.score += 1; } });
  if (collides(state)) return { ...state, phase: 'gameover', best: Math.max(state.best, state.score) }; return state;
}
export function inputAction(code, phase) { if (code === 'ArrowUp' || code === 'Space') return phase === 'gameover' ? 'restart' : 'flap'; if (code === 'KeyR' && phase === 'gameover') return 'restart'; if (code === 'Escape') return 'title'; return null; }
