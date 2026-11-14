'use strict';
const path = require('path');
const vscode = require('vscode');
const { buildObsidianUri, buildPathUri } = require('./uri-builder');
const { findVaultByName, isSameDir, readVaultRegistry } = require('./vault-registry');

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
        // 不在工作区内）则按独立 md 文件方式打开（path= 绝对路径，新版
        // Obsidian 支持打开非 vault 内的文件）。无法从注册表解析出该 vault
        // 的目录时，退回旧行为（假定工作区根 = vault 根）。
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
          url = buildPathUri(docUri.fsPath);
        }
      } else {
        // 自动模式：path= 绝对路径。Obsidian 会自动匹配已注册的 vault；
        // 文件不在任何 vault 内时，新版 Obsidian 会按独立 md 文件打开。
        url = buildPathUri(docUri.fsPath);
      }
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
