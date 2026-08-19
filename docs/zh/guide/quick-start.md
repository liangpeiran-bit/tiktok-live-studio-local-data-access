# 快速开始

本指南给出连接 LIVE Studio 本地数据开放的最短路径。

## 前置条件

- 本机已运行 LIVE Studio。
- 当前环境已开启本地数据开放。
- 已拿到发放的 `app_id`、`key_id` 和 `secret`。
- 客户端能够向 `127.0.0.1` 建立 WebSocket 连接。

::: warning 保护 secret
不要打印、持久化或上传原始 `secret`。它只用于在本机鉴权客户端。
:::

## 1. 扫描本机端口

LIVE Studio 会在约定范围内绑定一个端口：

```txt
127.0.0.1:30000-30015
```

依次尝试候选端点，直到收到合法的 `SERVER_HELLO`：

```txt
ws://127.0.0.1:{port}/v1/third-party
```

出现以下情况时关闭该候选连接并继续扫描：

- 连接失败。
- 连接超时。
- 首条消息不是合法的 `SERVER_HELLO`。
- `product`、`channel` 或 `version` 不符合本协议。

## 2. 校验 `SERVER_HELLO`

WebSocket 建立后，服务端会立即发送 `SERVER_HELLO`：

```json
{
  "type": "SERVER_HELLO",
  "product": "tiktok_live_studio",
  "channel": "third-party-im",
  "version": "1.0.0"
}
```

只有校验通过后才发送凭证。

## 3. 发送 `AUTH`

客户端第一条 JSON 消息必须是 `AUTH`。

```json
{
  "type": "AUTH",
  "app_id": "your_app_id",
  "key_id": "your_key_id",
  "secret": "your_secret",
  "version": "1.0.0"
}
```

服务端最多等待 20 秒完成有效鉴权。

## 4. 处理 `AUTH_RESULT`

鉴权成功时：

```json
{
  "type": "AUTH_RESULT",
  "success": true,
  "app_id": "your_app_id",
  "app_name": "Example App",
  "message": "Authentication successful",
  "server_time": 1786010400000,
  "version": "1.0.0"
}
```

此后连接可以接收 `EVENT` 消息。

鉴权失败时，检查 `error_code` 并停止使用该连接。

## 5. 监听事件

```json
{
  "type": "EVENT",
  "event": "live.chat",
  "timestamp": 1786010400000,
  "payload": {
    "message_id": "7520000000000000002",
    "room_id": "7520000000000000000",
    "content": "hello live"
  }
}
```

有 `message_id` 时用它做去重。

## 6. 安全重连

Socket 关闭后，从服务发现重新开始。新的 WebSocket 必须再次完成 `SERVER_HELLO` 校验和 `AUTH`。
