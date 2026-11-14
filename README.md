# Obsidian Opener

[English](#english) | [中文](./README.zh-CN.md)

[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/items?itemName=leonezhu.obsidian-opener)

## English

Open the Markdown file you are editing in VS Code inside local Obsidian, with one click.

### Install

From the VS Code Marketplace:

**[Obsidian Opener — Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=leonezhu.obsidian-opener)**

Or install from a local `.vsix`:

```bash
npx @vscode/vsce package --allow-missing-repository
code --install-extension obsidian-opener-0.3.1.vsix
```

### Usage

1. **Keyboard shortcut**: `Alt+O` on Windows/Linux, `⌘⌥O` (⌘ + Option + O) on macOS
2. **Button**: a purple gem icon in the top-right corner of a Markdown editor — click it to open the current file in Obsidian
3. **Command Palette**: `Obsidian: Open Current File in Obsidian`

### How it works

The generated URL has two modes:

**Auto mode (default, zero config)** — if the file is inside a registered vault, opens it with its absolute path (`obsidian://open?path=...`, Obsidian matches the vault automatically). If it is not inside any vault, the extension hands the file to Obsidian as a standalone file through the OS — the `path=` URI does **not** support files outside vaults (Obsidian would show "Vault not found"); standalone opening requires Obsidian 1.14+:

```
open -b md.obsidian /Users/me/Documents/a.md   # macOS
```

On Windows/Linux the file is opened via the `.md` file association (set Obsidian as the default Markdown app, supported since 1.14).

**Named vault mode** — set `obsidianOpener.vaultName` to enable, using vault name + relative path:

```
obsidian://open?vault=notes&file=References%2FDanKoe%2F2026-08-29-xxx
```

When you click the button, the extension first verifies whether the current document's repo (workspace root) actually matches that vault's directory in Obsidian's vault registry:

- Match → open with `vault=` + the path relative to the vault root (`.md` suffix stripped, URL-encoded)
- No match (the file belongs to another repo, or no workspace is open) → hand the file to Obsidian as a standalone file through the OS (requires Obsidian 1.14+)
- The vault name cannot be resolved from the registry → keep the legacy behavior (assume workspace root = vault root)

### Configuration

Open VS Code Settings, search for "Obsidian", and set **Obsidian Opener: Vault Name** to your vault name (the vault root folder's name, e.g. `notes`):

![Configure obsidianOpener.vaultName in VS Code Settings](assets/vault-setting.png)

| Setting | Default | Description |
|---|---|---|
| `obsidianOpener.vaultName` | `""` (empty) | Leave empty for auto mode; set a vault name to open files in that vault, with a standalone-file fallback when the file is not in it |

### Testing

Zero dependencies, uses Node's built-in test runner:

```bash
npm test
```

The golden test cases come from a real Obsidian URL (a DanKoe article link), compared character by character.

## 中文

见 [README.zh-CN.md](./README.zh-CN.md)。
