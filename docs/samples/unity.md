# Unity Sample

Unity clients should follow the same protocol flow as JavaScript clients:

1. Scan `127.0.0.1:30000-30015`.
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

## Unity-specific notes

- Dispatch gameplay changes back to Unity's main thread.
- Keep one active gateway connection per application.
- Avoid reconnecting every frame after a failure.
- Do not store the raw `secret` in scenes, prefabs, or logs.
- Use `message_id` to deduplicate events before driving gameplay.

