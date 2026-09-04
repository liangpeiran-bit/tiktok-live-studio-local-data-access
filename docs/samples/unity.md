# Unity Sample

Unity clients should follow the same protocol flow as JavaScript clients:

1. Scan `127.0.0.1:49152-65535` in bounded parallel batches.
2. Connect to `/v1/third-party`.
3. Validate `SERVER_HELLO`.
4. Send `AUTH`.
5. Dispatch `EVENT` messages by event name.

## Recommended structure

```txt
LiveStudioGatewayClient
├─ PortScanner
├─ WebSocketTransport
├─ Authenticator
├─ EventDispatcher
└─ ReconnectPolicy
```

## Pseudocode

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

`ConnectAndValidateHello` returns a socket only when the first message is the supported `SERVER_HELLO`; it closes failures, timeouts, malformed messages, and incompatible versions. Keep concurrency bounded and never open all 16,384 candidates at once.

## Event dispatch

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

## Map gifts to gameplay effects

Choose IDs in the [Gift Catalog](/reference/gift-catalog) and store them as strings in configuration. Resolve the rule before dispatching the actual gameplay work to Unity's main thread.

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

The catalog is only an authoring snapshot. Unknown IDs should be ignored or routed to a generic fallback without interrupting the receive loop.

## Unity-specific notes

- Dispatch gameplay changes back to Unity's main thread.
- Keep one active gateway connection per application.
- Avoid reconnecting every frame after a failure.
- Do not store the raw `secret` in scenes, prefabs, or logs.
- Use `message_id` to deduplicate events before driving gameplay.

