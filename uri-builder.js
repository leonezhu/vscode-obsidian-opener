'use strict';

/**
 * 纯函数模块：不依赖 vscode，可被 node --test 直接测试。
 * 职责：把 vault 内相对路径转成 obsidian://open URL。
 */

/** 去掉结尾的 .md 后缀（Obsidian 的 file 参数不带扩展名） */
function stripMd(p) {
  return p.replace(/\.md$/i, '');
}

/** 统一为 POSIX 分隔符（Windows 兼容） */
function toPosix(p) {
  return p.replace(/\\/g, '/');
}

/**
 * @param {string} vaultName vault 名称，如 "notes"
 * @param {string} relPath 相对 vault 根的路径，如 "References/DanKoe/xxx.md"
 * @returns {string} obsidian://open?vault=...&file=...
 */
function buildObsidianUri(vaultName, relPath) {
  const file = encodeURIComponent(stripMd(toPosix(relPath)));
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${file}`;
}

/**
 * 绝对路径形式：不需要指定 vault，Obsidian 按路径自动匹配已注册的 vault。
 * 与 file= 不同，path= 保留完整扩展名。
 * @param {string} absPath 文件绝对路径，如 "/Users/me/notes/a/b.md"
 * @returns {string} obsidian://open?path=...
 */
function buildPathUri(absPath) {
  return `obsidian://open?path=${encodeURIComponent(toPosix(absPath))}`;
}

module.exports = { stripMd, toPosix, buildObsidianUri, buildPathUri };

