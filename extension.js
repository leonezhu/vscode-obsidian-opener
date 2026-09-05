'use strict';
const path = require('path');
const vscode = require('vscode');
const { buildObsidianUri } = require('./uri-builder');

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
      // 计算相对 vault 根的路径；文件不在任何工作区文件夹内时退化为文件名
      const folder = vscode.workspace.getWorkspaceFolder(docUri);
      const rel = folder
        ? path.relative(folder.uri.fsPath, docUri.fsPath)
        : path.basename(docUri.fsPath);
      const vaultName = vscode.workspace
        .getConfiguration('obsidianOpener')
        .get('vaultName', 'notes');
      const url = buildObsidianUri(vaultName, rel);
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
