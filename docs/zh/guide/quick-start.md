# 快速开始

目标很简单：完成一次鉴权，收到一条真实事件。不需要先做出完整游戏。

## 1. 确认接入资格

**还没有获批？** 先[申请接入](/zh/apply)。等待期间可以体验[模拟 Demo](/zh/demos/)，但试玩不代表已获得真实直播间数据。

**已经获批？** 请准备：

- 与客户端运行在**同一台机器**上的 LIVE Studio。
- 按获批邮件说明，已开启本地数据能力的安装版本和账号。
- 为应用签发的 `app_id`、`key_id` 和 `secret`。

目前这里尚未列出已确认的最低 LIVE Studio 版本。请以获批邮件中的配置说明为准；仅升级客户端不代表能力已开通。缺少说明或凭证时，请联系 [liangpeiran@bytedance.com](mailto:liangpeiran@bytedance.com)。

## 2. 运行本地示例

按 [H5：可运行示例](/zh/samples/h5)下载三个小文件，并在 `127.0.0.1` 启动。预览服务需要 Node.js 22+，浏览器需要允许本地 WebSocket 访问。

运行时填写凭证，再点击 **Connect**。不要在公开试玩页输入密钥，也不要把密钥写进下载的源码。

预期状态：

```text
SCANNING → AUTHENTICATING → AUTHENTICATED
```

客户端会有界扫描 `49152–65535`，验证 `SERVER_HELLO` 后发送 `AUTH`。只有收到 `AUTH_RESULT.success=true` 才显示 **AUTHENTICATED**。

## 3. 收到第一条事件

在已开播的直播间里，产生一次应用已开放类型的互动。若已开放点赞或评论，可以从它们开始，不必购买礼物来测试连接。

例如，本地日志将显示：

```text
EVENT live.like
```

这是预期输出，不是示例自动注入的模拟事件。直播间没有新互动时，可能不会产生事件；鉴权成功也不代表所有消息类型均已开放。

| 现象 | 先检查什么 |
| --- | --- |
| `ENDPOINT_NOT_FOUND` | 是否同机运行、LIVE Studio 安装版本和账号是否已开启能力，以及浏览器本地网络策略。 |
| `INVALID_CREDENTIALS` 或 `ACCESS_DISABLED` | 签发的凭证和应用配置；不要连续快速重试。 |
| 已显示 `AUTHENTICATED`，没有事件 | 是否已开播、是否产生新互动、对应 IM 消息类型是否已开放。 |
| `POLICY_DISCONNECT_510` | 接入策略已变化，先确认资格再重连。 |

更多检查方法见[排障指南](/zh/guide/troubleshooting)。

## 4. 把事件接入游戏

选择一种[事件](/zh/events/)，把处理函数接到游戏动作上。礼物玩法可以从[礼物目录](/zh/reference/gift-catalog#检索礼物)复制字符串 ID，再决定连击何时触发效果。

保持连接逻辑与游戏规则独立。示例采用手动重连，不包含生产环境自动重试；每次新连接都需要重新发现服务和鉴权。上线前，按[连接生命周期](/zh/protocol/connection)补齐可取消的退避重连。

想让 Agent 帮忙？[安装 Agent Skill](/zh/guide/agent-skill)，或提供 [llms.txt](/zh/llms.txt)。Unity 开发者可以继续阅读[接入指南](/zh/samples/unity)。

::: warning 凭证管理
不要记录或上传密钥，不要放进公开静态资源或提交到仓库。此示例只在内存中使用密钥；正式客户端应通过受信任的运行时机制或系统密钥库管理凭证，不使用明文项目文件。
:::
