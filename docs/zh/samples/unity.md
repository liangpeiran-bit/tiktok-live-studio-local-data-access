# Unity 接入指南

本页提供结构建议和伪代码，不是可直接下载运行的 Unity 项目。建议先用[本地 H5 示例](/zh/samples/h5)验证第一条事件，再复用游戏现有的 WebSocket 库接入。

Unity 客户端应遵循与 JavaScript 客户端相同的协议流程：

1. 有界并发扫描 `127.0.0.1:49152-65535`。
2. 连接到 `/v1/third-party`。
3. 校验 `SERVER_HELLO`。
4. 发送 `AUTH`。
5. 等待 `AUTH_RESULT.success=true` 后，再按事件名分发 `EVENT` 消息。

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
const int PortStart = 49152;
const int PortEnd = 65535;
const int ScanBatchSize = 128;

for (var batchStart = PortStart; batchStart <= PortEnd; batchStart += ScanBatchSize)
{
    var batchEnd = Math.Min(batchStart + ScanBatchSize - 1, PortEnd);
    var attempts = Enumerable.Range(batchStart, batchEnd - batchStart + 1)
        .Select(port => ConnectAndValidateHello(
            $"ws://127.0.0.1:{port}/v1/third-party",
            timeoutMs: 500));
    var candidates = await Task.WhenAll(attempts);
    var socket = candidates.FirstOrDefault(candidate => candidate != null);
    if (socket == null) continue;

    foreach (var candidate in candidates.Where(candidate => candidate != null && candidate != socket))
        await candidate.Close();

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

`ConnectAndValidateHello` 只有在首条消息是当前客户端支持的 `SERVER_HELLO` 时才返回 Socket；连接失败、超时、消息格式错误或版本不兼容时都应主动关闭。并发数量必须有上限，不能一次打开全部 16384 个候选端口。

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

## 把礼物映射为玩法效果

先在[礼物目录](/zh/reference/gift-catalog)中选择 ID，并在配置中以字符串保存。解析规则后，再把真正的玩法操作派发到 Unity 主线程。

```csharp
readonly Dictionary<string, Action<int>> giftEffects = new()
{
    ["5655"] = count => SpawnRoses(count),
    ["6064"] = _ => ShowBanner("GG!"),
    ["7569"] = _ => ActivateControllerBoost(),
};

void HandleGift(LiveGiftPayload payload)
{
    if (!giftEffects.TryGetValue(payload.Gift.Id, out var effect)) return;
    if (!payload.RepeatEnd) return;

    var count = int.TryParse(payload.RepeatCount, out var parsed) && parsed > 0
        ? parsed
        : 1;
    mainThreadQueue.Enqueue(() => effect(count));
}
```

礼物目录只是编写配置时的快照。遇到未知 ID 时应忽略或进入通用兜底，不能中断接收循环。

## Unity 注意

- 把玩法侧变更派发回 Unity 主线程。
- 每个应用只保持一条活跃的网关连接。
- 失败后不要每一帧都重连。
- 不要把原始 `secret` 存进场景、prefab 或日志。
- 驱动玩法前，用 `message_id` 做事件去重。
