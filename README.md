# Obsidian Opener

在 VSCode 里打开 Obsidian vault 的 md 文件时，一键跳回本地 Obsidian。

## 用法

1. **快捷键**：`Alt+O`（聚焦编辑器时生效）
2. **按钮**：md 文件编辑器右上角有一个紫色宝石图标，点击即在 Obsidian 打开当前文件
3. **命令面板**：`Obsidian: 在 Obsidian 中打开当前文件`

生成的 URL 格式：

```
obsidian://open?vault=notes&file=References%2FDanKoe%2F2026-08-29-xxx
```

- `file` 为相对 vault 根的路径，去掉 `.md` 后缀，URL 编码
- 文件不在工作区内时退化为文件名（Obsidian 按最短唯一路径解析）

## 设置

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `obsidianOpener.vaultName` | `notes` | Obsidian vault 名称 |

## 安装

```bash
npx @vscode/vsce package --allow-missing-repository
code --install-extension obsidian-opener-0.1.0.vsix
```

## 测试

零依赖，用 Node 内置 test runner：

```bash
npm test
```

黄金用例来自真实 Obsidian URL（用户提供的 DanKoe 文章链接），逐字符比对。
