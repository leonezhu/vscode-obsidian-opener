'use strict';

/**
 * 纯函数模块：不依赖 vscode，可被 node --test 直接测试。
 * 职责：读取 Obsidian 的 vault 注册表（obsidian.json），判断文件是否在某个已注册 vault 内。
 * 注册表位置遵循 Electron 惯例：
 *   macOS   ~/Library/Application Support/obsidian/obsidian.json
 *   Windows %APPDATA%/obsidian/obsidian.json
 *   Linux   ~/.config/obsidian/obsidian.json
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

function registryPath() {
  switch (process.platform) {
    case 'darwin':
      return path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'obsidian',
        'obsidian.json'
      );
    case 'win32':
      return path.join(
        process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
        'obsidian',
        'obsidian.json'
      );
    default:
      return path.join(os.homedir(), '.config', 'obsidian', 'obsidian.json');
  }
}

/** 归一化路径用于比较：去掉结尾分隔符；Windows 下忽略大小写 */
function normalizeForCompare(p) {
  let n = path.normalize(toPosix(p));
  if (process.platform === 'win32') n = n.toLowerCase();
  return n.replace(/[\\/]+$/, '');
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

/**
 * 在 vault 注册表中找到包含 filePath 的最深 vault（嵌套 vault 时取最近的）。
 * @param {Object} vaults obsidian.json 的 vaults 字段，形如 { "<id>": { path, ts } }
 * @param {string} filePath 文件绝对路径
 * @returns {Object|null} 命中的 vault 条目；不在任何 vault 内时返回 null
 */
function findVaultForFile(vaults, filePath) {
  const target = normalizeForCompare(filePath);
  let best = null;
  let bestLen = -1;
  for (const entry of Object.values(vaults || {})) {
    if (!entry || typeof entry.path !== 'string') continue;
    const vp = normalizeForCompare(entry.path);
    const isInside = target === vp || target.startsWith(vp + '/');
    if (isInside && vp.length > bestLen) {
      best = entry;
      bestLen = vp.length;
    }
  }
  return best;
}

/**
 * 按 vault 名称查找已注册 vault。Obsidian 的 vault 名 = vault 根目录的 basename。
 * @param {Object} vaults obsidian.json 的 vaults 字段，形如 { "<id>": { path, ts } }
 * @param {string} name vault 名称，如 "notes"
 * @returns {Object|null} 命中的 vault 条目；找不到时返回 null
 */
function findVaultByName(vaults, name) {
  if (typeof name !== 'string' || !name) return null;
  const target = normalizeForCompare(name);
  for (const entry of Object.values(vaults || {})) {
    if (!entry || typeof entry.path !== 'string') continue;
    const base = path.basename(toPosix(entry.path).replace(/[\\/]+$/, ''));
    if (normalizeForCompare(base) === target) return entry;
  }
  return null;
}

/** 判断两个路径是否指向同一目录（归一化后比较；任一非字符串返回 false） */
function isSameDir(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  return normalizeForCompare(a) === normalizeForCompare(b);
}

/**
 * 读取 vault 注册表。读不到（未安装 Obsidian / 路径变化）时返回 null，
 * 调用方应跳过预检，直接交给 Obsidian 处理。
 * @returns {Object|null}
 */
function readVaultRegistry() {
  try {
    const raw = JSON.parse(fs.readFileSync(registryPath(), 'utf8'));
    return raw.vaults && typeof raw.vaults === 'object' ? raw.vaults : {};
  } catch {
    return null;
  }
}

module.exports = { registryPath, findVaultForFile, findVaultByName, isSameDir, readVaultRegistry };
