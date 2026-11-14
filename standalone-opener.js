'use strict';

/**
 * 纯函数模块：不依赖 vscode，可被 node --test 直接测试。
 * 职责：构造"以独立文件方式打开 vault 外 md 文件"的系统命令。
 *
 * 背景：obsidian://open?path= 只会在已注册 vault 中查找路径，找不到就报
 * "Vault not found"，并不支持 vault 外的文件。Obsidian 1.14+ 打开独立
 * md 文件走的是操作系统的文件关联 / "Open with"（见官方 1.14 changelog）。
 */

/**
 * @param {string} platform process.platform（'darwin' | 'win32' | 其他按 linux 处理）
 * @param {string} filePath 文件绝对路径
 * @returns {{cmd: string, args: string[], fallback?: {cmd: string, args: string[]}}}
 */
function buildStandaloneOpenCommand(platform, filePath) {
  switch (platform) {
    case 'darwin':
      // 优先用 bundle id 定位 Obsidian；找不到时由调用方回退到按应用名打开
      return {
        cmd: 'open',
        args: ['-b', 'md.obsidian', filePath],
        fallback: { cmd: 'open', args: ['-a', 'Obsidian', filePath] },
      };
    case 'win32':
      // explorer.exe 会用 .md 的默认打开方式（Obsidian 1.14 起可设为默认 md 应用）
      return { cmd: 'explorer.exe', args: [filePath] };
    default:
      // Linux：依赖 xdg-open 的 .md 关联
      return { cmd: 'xdg-open', args: [filePath] };
  }
}

module.exports = { buildStandaloneOpenCommand };
