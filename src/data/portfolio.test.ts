import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINE_TELEMETRY_NODES,
  HERO_COLLAGE,
  PROJECTS,
  SKILL_CATEGORIES,
  buildResumeText,
  computeScrollProgress,
  countTotalSkills,
  formatTimecode,
  getNextIndex,
} from './portfolio';
import { clampUnit, computeGlidePitch } from '../audio/soundEngine';

test('formatTimecode renders MM:SS:FF at 30fps cleanly', () => {
  assert.equal(formatTimecode(0), '00:00:00');
  assert.equal(formatTimecode(65500), '01:05:15');
  assert.equal(formatTimecode(-50), '00:00:00');
});

test('getNextIndex wraps cleanly across galleries', () => {
  assert.equal(getNextIndex(0, 'next', 7), 1);
  assert.equal(getNextIndex(6, 'next', 7), 0);
  assert.equal(getNextIndex(0, 'prev', 7), 6);
  assert.equal(getNextIndex(2, 'prev', 4), 1);
  assert.equal(getNextIndex(0, 'next', 0), 0);
});

test('projects, telemetry nodes, hero depth layers, and skills contain authentic entries', () => {
  assert.equal(PROJECTS.length, 5);
  assert.equal(PROJECTS[0].i.length, 7);
  assert.equal(PROJECTS[1].i.length, 4);
  assert.equal(PROJECTS[2].i.length, 4);
  assert.equal(PROJECTS[3].i.length, 5);
  assert.equal(PROJECTS[3].pt, true);
  assert.equal(PROJECTS[4].i.length, 0);

  assert.equal(ENGINE_TELEMETRY_NODES.length, 5);
  assert.ok(ENGINE_TELEMETRY_NODES.every((node) => node.label.length > 0 && node.readout.length > 0));

  const backCards = HERO_COLLAGE.filter((c) => c.layer === 'back');
  const frontCards = HERO_COLLAGE.filter((c) => c.layer === 'front');
  assert.equal(backCards.length, 3);
  assert.equal(frontCards.length, 3);

  assert.equal(SKILL_CATEGORIES.length, 4);
  assert.equal(countTotalSkills(SKILL_CATEGORIES), 37);

  const resume = buildResumeText();
  assert.ok(resume.includes('armin83mz@gmail.com'));
  assert.ok(resume.includes('REWIND-80'));
});

test('computeScrollProgress clamps cleanly across viewport bounds', () => {
  assert.equal(computeScrollProgress(900, 600, 900), 0);
  assert.equal(computeScrollProgress(1200, 600, 900), 0);
  assert.equal(computeScrollProgress(150, 600, 900), 0.5);
  assert.equal(computeScrollProgress(-600, 600, 900), 1);
  assert.equal(computeScrollProgress(-900, 600, 900), 1);
  assert.equal(computeScrollProgress(100, 0, 0), 0);
});

test('audio spatial glide math clamps pan and pitch cleanly', () => {
  assert.equal(clampUnit(2.5), 1);
  assert.equal(clampUnit(-4), -1);
  assert.equal(clampUnit(NaN), 0);
  assert.ok(computeGlidePitch(0) >= 0.85);
  assert.ok(computeGlidePitch(500) <= 1.31);
});
