import assert from 'node:assert/strict';
import {WaveField, WAVE_LIMITS} from '../dist/wave-field.js';

const finite = field => {
  assert.ok(field.current.every(Number.isFinite));
  assert.ok(field.previous.every(Number.isFinite));
  assert.ok(Number.isFinite(field.energy));
  assert.ok(field.cols * field.rows <= WAVE_LIMITS.maxCells);
};
const zero = new WaveField({width: 500, depth: 500});
for (let i = 0; i < 240; i++) zero.step(1 / 60);
assert.equal(zero.energy, 0);
assert.ok(zero.current.every(value => value === 0));

const options = {width: 500, depth: 500};
const first = new WaveField(options), second = new WaveField(options), together = new WaveField(options);
first.disturb(210, 230, .8, 3);
second.disturb(280, 255, -.65, 3);
together.disturb(210, 230, .8, 3);
together.disturb(280, 255, -.65, 3);
for (let i = 0; i < 180; i++) {
  first.step(1 / 60); second.step(1 / 60); together.step(1 / 60);
}
let residual = 0, magnitude = 0;
for (let i = 0; i < together.current.length; i++) {
  residual += Math.abs(together.current[i] - first.current[i] - second.current[i]);
  magnitude += Math.abs(first.current[i]) + Math.abs(second.current[i]);
}
const relativeSuperpositionError = residual / magnitude;
assert.ok(relativeSuperpositionError < 2e-5, `Linear superposition error ${relativeSuperpositionError}`);
const cancel = new WaveField(options);
cancel.disturb(250, 250, 1, 4); cancel.disturb(250, 250, -1, 4);
for (let i = 0; i < 180; i++) cancel.step(1 / 60);
assert.ok(Math.max(...cancel.current) < 1e-6);
assert.ok(Math.min(...cancel.current) > -1e-6);

const decay = new WaveField({width: 700, depth: 700});
decay.disturb(350, 350, .8, 3);
let energyAtOne = 0;
for (let i = 0; i < 480; i++) {
  decay.step(1 / 60);
  if (i === 59) energyAtOne = decay.energy;
}
const decayRatio = decay.energy / energyAtOne;
assert.ok(energyAtOne > 0);
assert.ok(decayRatio < .02, `Eight-second decay ratio ${decayRatio}`);

const sizes = [];
for (const [width, depth] of [[1280, 720 / Math.SQRT1_2], [390, 844 / Math.SQRT1_2], [3840, 2160 / Math.SQRT1_2], [1, 1], [1e6, 1]]) {
  const field = new WaveField({width, depth});
  for (let i = 0; i < 180; i++) {
    if (i % 13 === 0) field.disturb(width * (.2 + .6 * ((i * 17 % 101) / 100)), depth * .53, .5, 3);
    field.step(1 / 24);
    if (i % 30 === 0) finite(field);
  }
  const before = field.simulatedTime;
  const steps = field.step(1e6);
  assert.ok(steps <= WAVE_LIMITS.maxStepsPerCall);
  assert.ok(field.simulatedTime - before <= WAVE_LIMITS.maxInputDt + field.fixedDt + 1e-8);
  finite(field);
  assert.equal(field.sample(NaN, 4), 0);
  assert.ok(Number.isFinite(field.sample(-1000, depth * 3)));
  sizes.push({width, depth, cols: field.cols, rows: field.rows, nodes: field.cols * field.rows, fixedDt: field.fixedDt});
  field.resize({width: 400, depth: 300});
  assert.equal(field.energy, 0);
  assert.ok(field.current.every(value => value === 0));
  field.step(.05); finite(field);
}

console.log(JSON.stringify({passed: true, relativeSuperpositionError, oppositeSourcesCancel: true, decayRatioAtEightVersusOneSecond: decayRatio, zeroFieldStable: true, resizeResets: true, largeDtBounded: true, sizes}, null, 2));
