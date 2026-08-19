# Unity 示例

Unity 客户端应遵循与 JavaScript 客户端相同的协议流程：

1. 扫描 `127.0.0.1:30000-30015`。
2. 连接到 `/v1/third-party`。
3. 校验 `SERVER_HELLO`。
4. 发送 `AUTH`。
5. 按事件名分发 `EVENT` 消息。

## 推荐结构

```txt
LiveStudioGatewayClient
├─ PortScanner
├─ WebSocketTransport
├─ Authenticator
├─ EventDispatcher
└─ ReconnectPolicy
```

## 伪代码

```csharp
for (var port = 30000; port <= 30015; port++)
{
    var url = $"ws://127.0.0.1:{port}/v1/third-party";
    var socket = new WebSocket(url);

    await socket.Connect();

    var firstMessage = await socket.ReceiveJson(timeoutMs: 3000);
    if (!IsValidServerHello(firstMessage))
    {
        await socket.Close();
        continue;
    }

    await socket.SendJson(new
    {
        type = "AUTH",
        app_id = appId,
        key_id = keyId,
        secret = secret,
        version = "1.0.0"
    });

    StartReceiveLoop(socket);
    break;
}
```

## 事件分发

```csharp
void HandleEvent(EventEnvelope envelope)
{
    switch (envelope.Event)
    {
        case "live.like":
            HandleLike(envelope.Payload);
            break;
        case "live.gift":
            HandleGift(envelope.Payload);
            break;
        case "live.chat":
            HandleChat(envelope.Payload);
            break;
    }
}
```

## Unity 注意

- 把玩法侧变更派发回 Unity 主线程。
- 每个应用只保持一条活跃的网关连接。
- 失败后不要每一帧都重连。
- 不要把原始 `secret` 存进场景、prefab 或日志。
- 驱动玩法前，用 `message_id` 做事件去重。
