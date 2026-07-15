import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const sandbox = {};
vm.runInNewContext(readFileSync(new URL('./game-logic.js', import.meta.url), 'utf8'), sandbox);
const { WORLD, newGame, flap, applyAction, tick, collides, difficultyForScore, inputAction } = sandbox.FlappyAsimLogic;

test('start transition makes the bird playable and moves it upward', () => {
  const state = applyAction(newGame(), inputAction('ArrowUp', 'ready'));
  assert.equal(state.phase, 'playing');
  assert.equal(state.velocity, WORLD.flapVelocity);
  const moved = tick(state, .05, () => .5);
  assert.ok(moved.birdY < state.birdY);
});

test('gravity moves the bird downward deterministically', () => {
  const state = tick(flap(newGame()), .2, () => .5);
  assert.ok(state.birdY < 330);
  assert.equal(state.pipes.length, 0);
});

test('pipes spawn with a deterministic gap and award one point after passing', () => {
  let state = tick({ ...flap(newGame()), spawnTimer: WORLD.spawnEvery - .01, birdY: 300 }, .01, () => 0);
  assert.equal(state.pipes.length, 1);
  assert.equal(state.pipes[0].gapTop, 86);
  assert.equal(state.pipes[0].gap, WORLD.pipeGap);
  state = tick({ ...state, birdY: 300, pipes: [{ ...state.pipes[0], x: 0, gapTop: 250 }] }, .01, () => 0);
  assert.equal(state.score, 1);
});

test('difficulty increases gradually and remains bounded', () => {
  const calm = difficultyForScore(0);
  const harder = difficultyForScore(10);
  const maximum = difficultyForScore(1000);
  assert.ok(harder.pipeSpeed > calm.pipeSpeed);
  assert.ok(harder.pipeGap < calm.pipeGap);
  assert.ok(harder.spawnEvery < calm.spawnEvery);
  assert.equal(maximum.pipeSpeed, WORLD.maxPipeSpeed);
  assert.equal(maximum.pipeGap, WORLD.minPipeGap);
  assert.equal(maximum.spawnEvery, WORLD.minSpawnEvery);
});

test('tick uses the score-based pipe speed', () => {
  const score = 10;
  const difficulty = difficultyForScore(score);
  const state = { ...flap(newGame()), score, birdY: 300, pipes: [{ x: 300, gapTop: 200, gap: difficulty.pipeGap, scored: false }] };
  const moved = tick(state, .1, () => .5);
  assert.equal(moved.pipes[0].x, 300 - difficulty.pipeSpeed * .1);
});

test('collision ends play and preserves the best score', () => {
  const state = { ...flap(newGame(2)), birdY: WORLD.height - WORLD.groundHeight - 1, score: 4 };
  const ended = tick(state, .01, () => .5);
  assert.equal(ended.phase, 'gameover');
  assert.equal(ended.best, 4);
  assert.equal(collides(ended), true);
});

test('complete game-over and restart flow returns to ready, then playing', () => {
  const crashed = tick({ ...flap(newGame(3)), birdY: WORLD.height - WORLD.groundHeight - 1 }, .01);
  assert.equal(crashed.phase, 'gameover');
  const restartAction = inputAction('ArrowUp', crashed.phase);
  assert.equal(restartAction, 'restart');
  const ready = applyAction(crashed, restartAction);
  assert.equal(ready.phase, 'ready');
  assert.equal(ready.score, 0);
  assert.equal(ready.best, 3);
  const playing = applyAction(ready, inputAction('Space', ready.phase));
  assert.equal(playing.phase, 'playing');
  assert.equal(playing.velocity, WORLD.flapVelocity);
});

test('keyboard input covers the Windows primary and alternate controls', () => {
  assert.equal(inputAction('ArrowUp', 'ready'), 'flap');
  assert.equal(inputAction('Space', 'playing'), 'flap');
  assert.equal(inputAction('ArrowUp', 'gameover'), 'restart');
  assert.equal(inputAction('KeyR', 'gameover'), 'restart');
  assert.equal(inputAction('KeyR', 'playing'), null);
});
