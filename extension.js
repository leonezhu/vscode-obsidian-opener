'use strict';
const path = require('path');
const { execFile, spawn } = require('child_process');
const vscode = require('vscode');
const { buildObsidianUri, buildPathUri } = require('./uri-builder');
const {
  findVaultForFile,
  findVaultByName,
  isSameDir,
  readVaultRegistry,
} = require('./vault-registry');
const { buildStandaloneOpenCommand } = require('./standalone-opener');

/** 执行一条系统打开命令（Promise 化），失败时 reject */
function runOpenCommand(command) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'darwin') {
      // open 命令失败（如未安装 Obsidian）会以非零码退出，可据此报错/回退
      execFile(command.cmd, command.args, (err) =>
        err ? reject(err) : resolve()
      );
    } else {
      // explorer.exe/xdg-open 的退出码不可靠，发射后不管
      try {
        spawn(command.cmd, command.args, {
          detached: true,
          stdio: 'ignore',
        }).unref();
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * 以独立文件方式打开 vault 外的 md 文件（Obsidian 1.14+ 支持）。
 * macOS 先按 bundle id 找 Obsidian，失败再按应用名重试。
 */
async function openStandalone(filePath) {
  const primary = buildStandaloneOpenCommand(process.platform, filePath);
  try {
    await runOpenCommand(primary);
    return;
  } catch (err) {
    if (primary.fallback) {
      try {
        await runOpenCommand(primary.fallback);
        return;
      } catch (fallbackErr) {
        err = fallbackErr;
      }
    }
    vscode.window.showErrorMessage(
      'Obsidian Opener：无法以独立文件方式打开（需 Obsidian 1.14+）：' +
        (err && err.message ? err.message : String(err))
    );
  }
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    'obsidian-opener.openInObsidian',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('Obsidian Opener：当前没有聚焦的编辑器');
        return;
      }
      const docUri = editor.document.uri;
      if (docUri.scheme !== 'file') {
        vscode.window.showInformationMessage('Obsidian Opener：只支持打开本地文件');
        return;
      }
      const vaultName = vscode.workspace
        .getConfiguration('obsidianOpener')
        .get('vaultName', '');
      let url;
      if (vaultName) {
        // 指定 vault 模式：先校验当前文档所在 repo（工作区根）与该 vault 的
        // 实际目录是否一致。一致才用 vault= + 相对路径；不一致（或文件根本
        // 不在工作区内）则改用系统方式按独立 md 文件打开（Obsidian 1.14+
        // 支持打开非 vault 内的文件；path= URI 会报 Vault not found）。
        // 无法从注册表解析出该 vault 的目录时，退回旧行为（假定工作区根 = vault 根）。
        const folder = vscode.workspace.getWorkspaceFolder(docUri);
        const vaultEntry = findVaultByName(readVaultRegistry(), vaultName);
        if (vaultEntry && folder && isSameDir(vaultEntry.path, folder.uri.fsPath)) {
          url = buildObsidianUri(vaultName, path.relative(folder.uri.fsPath, docUri.fsPath));
        } else if (!vaultEntry) {
          // 注册表里找不到该名字的 vault：无法校验，保持旧行为
          const rel = folder
            ? path.relative(folder.uri.fsPath, docUri.fsPath)
            : path.basename(docUri.fsPath);
          url = buildObsidianUri(vaultName, rel);
        } else {
          await openStandalone(docUri.fsPath);
          return;
        }
      } else {
        // 自动模式：文件在某个已注册 vault 内时用 path= 绝对路径；
        // 不在任何 vault 内时改用系统方式按独立 md 文件打开。
        const vaults = readVaultRegistry();
        if (vaults && !findVaultForFile(vaults, docUri.fsPath)) {
          await openStandalone(docUri.fsPath);
          return;
        }
        url = buildPathUri(docUri.fsPath);
      }
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate, openStandalone };
