'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { buildObsidianUri, stripMd, toPosix } = require('../uri-builder');

// 黄金用例：来自用户提供的真实 Obsidian URL（2026-08-29 DanKoe 文章）
const GOLDEN =
  'obsidian://open?vault=notes&file=References%2FDanKoe%2F2026-08-29-DanKoe-%E4%B8%80%E4%BA%BA%E4%BC%81%E4%B8%9A%E9%87%8D%E5%90%AF%E4%BB%8E%E5%8D%96%E8%AF%BE%E5%88%B0%E5%8D%96%E5%AD%A6%E4%B9%A0%E4%BD%93%E9%AA%8C';

test('黄金用例：DanKoe 文章生成的 URL 与用户示例逐字符一致', () => {
  const got = buildObsidianUri(
    'notes',
    'References/DanKoe/2026-08-29-DanKoe-一人企业重启从卖课到卖学习体验.md'
  );
  assert.strictEqual(got, GOLDEN);
});

test('黄金用例反向验证：示例中的 file 参数解码后等于真实相对路径（去 .md）', () => {
  const fileParam = GOLDEN.split('&file=')[1];
  assert.strictEqual(
    decodeURIComponent(fileParam),
    'References/DanKoe/2026-08-29-DanKoe-一人企业重启从卖课到卖学习体验'
  );
});

test('vault 名含空格时被正确编码', () => {
  const got = buildObsidianUri('My Vault', 'a/b.md');
  assert.strictEqual(got, 'obsidian://open?vault=My%20Vault&file=a%2Fb');
});

test('路径含空格时用 %20 编码', () => {
  const got = buildObsidianUri('notes', 'References/My Note.md');
  assert.ok(got.endsWith('References%2FMy%20Note'));
});

test('路径不含 .md 后缀时不重复处理', () => {
  const got = buildObsidianUri('notes', 'References/Note');
  assert.ok(got.endsWith('References%2FNote'));
});

test('Windows 反斜杠归一化为正斜杠后再编码', () => {
  assert.strictEqual(toPosix('References\\DanKoe\\a.md'), 'References/DanKoe/a.md');
  const got = buildObsidianUri('notes', 'References\\DanKoe\\a.md');
  assert.ok(got.endsWith('References%2FDanKoe%2Fa'));
});

test('仅去掉结尾的 .md，中间的不动', () => {
  assert.strictEqual(stripMd('a.md/b.md'), 'a.md/b');
  assert.strictEqual(stripMd('a.markdown'), 'a.markdown'); // 只处理 .md，不误伤 .markdown
});
