# Obsidian Opener

[English](./README.md) | [中文](#中文)

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=leonezhu.obsidian-opener)

## 中文

在 VSCode 里编辑 Obsidian vault 的 md 文件时，一键跳回本地 Obsidian。

### 安装

从 VS Code 插件市场安装：

**[Obsidian Opener — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=leonezhu.obsidian-opener)**

或从本地 `.vsix` 安装：

```bash
npx @vscode/vsce package --allow-missing-repository
code --install-extension obsidian-opener-0.3.0.vsix
```

### 用法

1. **快捷键**：Windows/Linux `Alt+O`，macOS `⌘⌥O`（⌘ + Option + O）
2. **按钮**：md 文件编辑器右上角有一个紫色宝石图标，点击即在 Obsidian 打开当前文件
3. **命令面板**：`Obsidian: 在 Obsidian 中打开当前文件`

### 工作原理

生成的 URL 有两种模式：

**自动模式（默认，零配置）**——用文件绝对路径，由 Obsidian 自动匹配包含它的已注册 vault；文件不在任何 vault 内时，新版 Obsidian 会按独立 md 文件打开：

```
obsidian://open?path=%2FUsers%2Fme%2Fnotes%2FReferences%2FDanKoe%2F2026-08-29-xxx.md
```

**指定 vault 模式**——设置 `obsidianOpener.vaultName` 后启用，用 vault 名 + 相对路径：

```
obsidian://open?vault=notes&file=References%2FDanKoe%2F2026-08-29-xxx
```

点击图标时，插件会先校验：当前文档所在 repo（工作区根）与该 vault 在 Obsidian 注册表中的实际目录是否一致：

- 一致 → 用 `vault=` + 相对 vault 根的路径打开（去掉 `.md` 后缀，URL 编码）
- 不一致（如文件属于别的仓库、或根本不在工作区内）→ 降级为独立文件方式（`path=` 绝对路径）打开
- 注册表里找不到该名字的 vault（无法校验）→ 保持旧行为，假定工作区根 = vault 根

### 配置

打开 VSCode 设置，搜索 "Obsidian"，把 **Obsidian Opener: Vault Name** 设为你的 vault 名称（即 vault 根目录的文件夹名，如 `notes`）：

![在 VSCode 设置中配置 obsidianOpener.vaultName](assets/vault-setting.png)

| 设置项 | 默认值 | 说明 |
|---|---|---|
| `obsidianOpener.vaultName` | `""`（空） | 留空用自动模式；填写 vault 名称则用该 vault 打开，文件不在其中时按独立文件方式打开 |

### 测试

零依赖，用 Node 内置 test runner：

```bash
npm test
```

黄金用例来自真实 Obsidian URL（用户提供的 DanKoe 文章链接），逐字符比对。

## English

See [README.md](./README.md).
