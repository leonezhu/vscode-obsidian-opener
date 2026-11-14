'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildStandaloneOpenCommand } = require('../standalone-opener');

// ---- macOS：open -b md.obsidian，带按应用名的 fallback ----

test('darwin 用 bundle id 打开，并带回退方案', () => {
  const got = buildStandaloneOpenCommand('darwin', '/Users/me/a.md');
  assert.deepStrictEqual(got.args, ['-b', 'md.obsidian', '/Users/me/a.md']);
  assert.deepStrictEqual(got.fallback.args, ['-a', 'Obsidian', '/Users/me/a.md']);
});

// ---- Windows / Linux：依赖 .md 文件关联 ----

test('win32 用 explorer.exe（走默认打开方式）', () => {
  const got = buildStandaloneOpenCommand('win32', 'C:\\notes\\a.md');
  assert.strictEqual(got.cmd, 'explorer.exe');
  assert.deepStrictEqual(got.args, ['C:\\notes\\a.md']);
  assert.strictEqual(got.fallback, undefined);
});

test('linux 用 xdg-open', () => {
  const got = buildStandaloneOpenCommand('linux', '/home/me/a.md');
  assert.strictEqual(got.cmd, 'xdg-open');
  assert.deepStrictEqual(got.args, ['/home/me/a.md']);
});

test('路径含空格时原样传入，不做二次编码', () => {
  const got = buildStandaloneOpenCommand('darwin', '/Users/me/My Notes/一 人.md');
  assert.strictEqual(got.args[2], '/Users/me/My Notes/一 人.md');
});
