# 排障

本地客户端无法发现服务、鉴权失败或收不到事件时，使用本页。

## 找不到本机服务

现象：

- `30000` 到 `30015` 全部失败。
- WebSocket 始终打不开。

检查：

- LIVE Studio 正在运行。
- 客户端使用 `127.0.0.1`，而不是局域网 IP 或远程主机。
- 路径必须精确为 `/v1/third-party`。
- 当前环境已开启本地数据开放。
- 没有防火墙或安全软件拦截回环 WebSocket。

## 已连接但没有合法 `SERVER_HELLO`

现象：

- Socket 打开了，但首条消息缺失或不符合协议。
- `product` 或 `channel` 不符合预期。

处理：

- 把该端口当作非目标服务。
- 关闭连接。
- 继续扫描下一个端口。
- 不要向该连接发送凭证。

合法的 `SERVER_HELLO`：

```json
{
  "type": "SERVER_HELLO",
  "product": "tiktok_live_studio",
  "channel": "third-party-im",
  "version": "1.0.0"
}
```

## `INVALID_FORMAT`

`AUTH` 消息格式无效。

常见原因：

- 客户端第一条 JSON 消息不是 `AUTH`。
- 缺少 `app_id`、`key_id` 或 `secret`。
- 必填字段是空字符串。
- payload 不是合法 JSON。

## `ACCESS_DISABLED`

本地数据开放被策略关闭。

请联系 LIVE Studio 对接负责人，确认当前环境已开启本地数据开放。

## `INVALID_CREDENTIALS`

提供的凭证与白名单不匹配。

检查：

- `app_id` 没有多余空格。
- `key_id` 是当前密钥版本。
- `secret` 是原始明文，而不是哈希。
- 应用仍在白名单中。

::: danger 不要记录 secret
排查凭证失败时，永远不要打印或上传原始 `secret`。
:::

## `CONNECTION_LIMIT`

网关拒绝连接，因为达到了全局或单应用连接上限。

处理：

- 每个本地客户端只复用一条连接。
- 关闭残留客户端进程。
- 避免无退避的重连循环。

## `AUTH_TIMEOUT`

Socket 打开后 20 秒内没有完成鉴权。

处理：

- 校验 `SERVER_HELLO` 后立即发送 `AUTH`。
- 不要再等待其他应用层提示。
- 确保 `AUTH` payload 以 JSON 文本消息发送。

## 已鉴权但没有事件

检查：

- 该事件已在白名单中。
- 直播间正在产生该类型事件。
- 客户端按 `event` 名分发，而不是只按 payload 形状判断。
- 客户端能处理可选字段和空回退值。

## 收到 `DISCONNECT`，`reason_code=510`

`510` 表示接入策略发生了变化。典型原因：

- 本地数据开放被关闭。
- 应用凭证被撤销或变更。
- 应用超过了策略限额。
- 事件或应用白名单被更新。

处理：

- 停止使用当前连接。
- 刷新凭证，或联系对接负责人。
- 策略纠正后再重新做服务发现和鉴权。

## 心跳超时

服务端使用原生 WebSocket ping/pong。标准 WebSocket 库通常会自动回复 pong。

除非你自己的应用层需要，否则不要实现自定义 JSON `HEARTBEAT` 消息。它不属于本协议。
