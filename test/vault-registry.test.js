'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildPathUri } = require('../uri-builder');
const { findVaultForFile, findVaultByName, isSameDir } = require('../vault-registry');

// ---- buildPathUri：obsidian://open?path= 绝对路径形式 ----

test('path= 保留 .md 扩展名，斜杠编码为 %2F', () => {
  const got = buildPathUri('/Users/me/notes/References/a.md');
  assert.strictEqual(got, 'obsidian://open?path=%2FUsers%2Fme%2Fnotes%2FReferences%2Fa.md');
});

test('path= 编码空格与中文', () => {
  const got = buildPathUri('/Users/me/My Notes/一人企业.md');
  assert.ok(got.startsWith('obsidian://open?path=%2FUsers%2Fme%2FMy%20Notes%2F'));
  assert.ok(got.endsWith(encodeURIComponent('/一人企业.md')));
});

// ---- findVaultForFile：vault 匹配逻辑 ----

const VAULTS = {
  'abc123': { path: '/Users/me/notes', ts: 1 },
  'def456': { path: '/Users/me/work-vault', ts: 2 },
};

test('文件在 vault 内时命中该 vault', () => {
  assert.strictEqual(findVaultForFile(VAULTS, '/Users/me/notes/a/b.md').path, '/Users/me/notes');
});

test('文件不在任何 vault 内时返回 null', () => {
  assert.strictEqual(findVaultForFile(VAULTS, '/Users/other/docs/a.md'), null);
});

test('vault 根本身也算命中', () => {
  assert.strictEqual(findVaultForFile(VAULTS, '/Users/me/notes').path, '/Users/me/notes');
});

test('前缀相同但目录名不同不算命中（/notes-x 不匹配 /notes）', () => {
  assert.strictEqual(findVaultForFile(VAULTS, '/Users/me/notes-x/a.md'), null);
});

test('嵌套 vault 时取最深（最近）的那个', () => {
  const nested = {
    ...VAULTS,
    'ghi789': { path: '/Users/me/notes/sub', ts: 3 },
  };
  assert.strictEqual(
    findVaultForFile(nested, '/Users/me/notes/sub/deep/a.md').path,
    '/Users/me/notes/sub'
  );
});

test('vault 路径结尾带斜杠不影响匹配', () => {
  const trailing = { 'x': { path: '/Users/me/notes/', ts: 1 } };
  assert.strictEqual(findVaultForFile(trailing, '/Users/me/notes/a.md').path, '/Users/me/notes/');
});

test('注册表为空或非对象时返回 null', () => {
  assert.strictEqual(findVaultForFile({}, '/Users/me/notes/a.md'), null);
  assert.strictEqual(findVaultForFile(null, '/Users/me/notes/a.md'), null);
  assert.strictEqual(findVaultForFile({ bad: { ts: 1 } }, '/Users/me/notes/a.md'), null);
});

// ---- findVaultByName：按名字（vault 根目录的 basename）查找 vault ----

test('按名字命中对应 vault 条目', () => {
  assert.strictEqual(findVaultByName(VAULTS, 'notes').path, '/Users/me/notes');
  assert.strictEqual(findVaultByName(VAULTS, 'work-vault').path, '/Users/me/work-vault');
});

test('名字不存在时返回 null', () => {
  assert.strictEqual(findVaultByName(VAULTS, 'nope'), null);
  assert.strictEqual(findVaultByName(VAULTS, ''), null);
  assert.strictEqual(findVaultByName(null, 'notes'), null);
});

test('vault 路径结尾带斜杠时 basename 仍能匹配', () => {
  const trailing = { 'x': { path: '/Users/me/notes/', ts: 1 } };
  assert.strictEqual(findVaultByName(trailing, 'notes').path, '/Users/me/notes/');
});

// ---- isSameDir：归一化目录比较 ----

test('同一路径（含结尾斜杠差异）判定为同一目录', () => {
  assert.strictEqual(isSameDir('/Users/me/notes', '/Users/me/notes/'), true);
  assert.strictEqual(isSameDir('/Users/me/notes', '/Users/me/notes-x'), false);
  assert.strictEqual(isSameDir('/Users/me/notes', '/Users/other/notes'), false);
});

test('非字符串输入返回 false', () => {
  assert.strictEqual(isSameDir(null, '/x'), false);
  assert.strictEqual(isSameDir('/x', undefined), false);
});
