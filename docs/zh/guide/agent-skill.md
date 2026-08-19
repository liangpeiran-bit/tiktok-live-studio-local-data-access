# Agent Skill

本仓库提供了一套可复用的开发 Agent Skill，用于在任意应用技术栈中接入 LIVE Studio 本地数据开放能力。

```txt
.agents/skills/tiktok-live-studio-local-data-access/
├── SKILL.md
├── agents/openai.yaml
└── references/
    ├── protocol.md
    ├── events.md
    ├── stack-adaptation.md
    └── verification.md
```

这套 Skill 以协议为核心，而不是让 Agent 生搬某一种语言的示例。Agent 会先检查开发者项目现有的运行时、依赖、生命周期和并发模型，再把同一套连接流程适配到 JavaScript、TypeScript、Electron、H5、Unity、.NET、Java、Kotlin、Python、Go、Rust、C++、Unreal Engine 或其他兼容的本地运行时。

## Agent 会掌握什么

Skill 覆盖以下完整流程：

- 判断客户端是否与 LIVE Studio 运行在同一台机器；
- 扫描端口并严格校验 `SERVER_HELLO`；
- 按正确顺序发送 `AUTH`，安全管理凭证；
- 处理事件 DTO、可选字段、去重和纯文本安全；
- 管理长连接、取消、退避重连以及断开原因 `510`；
- 适配不同技术栈的生命周期、线程和事件循环；
- 使用模拟 WebSocket 服务测试、安全审查，并明确真实联调边界。

Skill 也明确禁止 Agent：把本地服务暴露到远端、在校验服务身份前发送凭证、自创 JSON 心跳、把密钥打进浏览器静态资源，或者为了接入 WebSocket 强制迁移项目技术栈。

## 在本仓库中使用

支持的 Codex、Cursor 2.4+、OpenCode、GitHub Copilot 和 Gemini CLI 版本可以从 `.agents/skills/` 自动发现项目 Skill。需要时可显式调用：

```text
使用 $tiktok-live-studio-local-data-access，把 live.gift 接入当前项目。
```

不同 Agent 的显式调用语法可能不同。下面这条提示词不依赖具体 Agent 产品：

```text
完整阅读 .agents/skills/tiktok-live-studio-local-data-access/SKILL.md 以及它要求的参考文件，然后按照该流程把 LIVE Studio 本地事件接入当前项目，不要改变项目现有技术栈。
```

对于不会自动扫描 `.agents/skills/` 的 Agent，也可以使用这条显式读取提示词。

## 安装到其他项目

最快的分发方式是使用开放的 Skills CLI。它会从当前 GitHub 仓库发现 Skill，并安装到开发者机器上检测到的编码 Agent：

```bash
npx skills add liangpeiran-bit/tiktok-live-studio-local-data-access \
  --skill tiktok-live-studio-local-data-access \
  -g
```

`-g` 表示在开发者的所有项目中可用；去掉 `-g` 则只安装到当前项目。需要无交互地指定 Agent 时：

```bash
npx skills add liangpeiran-bit/tiktok-live-studio-local-data-access \
  --skill tiktok-live-studio-local-data-access \
  -g -a codex -a claude-code -a cursor -y
```

本仓库更新后，可以更新已安装副本：

```bash
npx skills update tiktok-live-studio-local-data-access -g -y
```

没有 Node.js/npm 的开发者可以下载仓库或 Release 压缩包，再把**整个目录**复制到目标项目：

```text
源目录：
  .agents/skills/tiktok-live-studio-local-data-access/

Codex、Cursor、OpenCode、Copilot、Gemini CLI 推荐目标：
  <project>/.agents/skills/tiktok-live-studio-local-data-access/

Claude Code 目标：
  <project>/.claude/skills/tiktok-live-studio-local-data-access/

Trae 目标：
  <project>/.trae/skills/tiktok-live-studio-local-data-access/
```

不要只复制 `SKILL.md`；协议、事件、技术栈适配和验收参考文件都是流程的一部分。

团队同时使用多种 Agent 产品时，建议把 `.agents/skills/` 作为唯一源。Claude Code 和 Trae 可以通过显式读取提示词，或由团队在本地维护链接/副本；不要在仓库中维护多份可编辑副本，以免内容漂移。

## 提问示例

```text
使用 LIVE Studio Local Data Access Skill，把点赞和礼物事件接入这个 Unity 游戏，复用项目已有的 WebSocket 包。
```

```text
按照 LIVE Studio Skill 审查这个 Python 客户端，重点检查 hello 校验、鉴权顺序、重连和密钥日志。
```

```text
排查这个 Electron 弹幕层为什么能鉴权，但 LIVE Studio 重启后收不到聊天事件。
```

## 后续维护

公开文档仍然是协议事实来源。当端点、协议版本、消息字段、事件结构或重连规则变化时：

1. 同步修改中英文文档；
2. 更新 Skill 的 `references/` 中对应文件；
3. 校验 Skill 并构建 VitePress 站点；
4. 将完整 Skill 目录重新分发到已安装副本的项目。

当前 Skill 对应协议版本为 `1.0.0`。
