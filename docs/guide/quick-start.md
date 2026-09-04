# Quick Start

This guide shows the shortest path to connect a local client to LIVE Studio Local Data Access.

## Prerequisites

- LIVE Studio is running on the same machine.
- Local data access is enabled for the current environment.
- You have an issued `app_id`, `key_id`, and `secret`.
- Your client can open a WebSocket connection to `127.0.0.1`.

::: warning Keep the secret private
Do not print, persist, or upload the raw `secret`. It is only used locally to authenticate the client.
:::

## 1. Discover the local port

LIVE Studio binds one port in the agreed dynamic range:

```txt
127.0.0.1:49152-65535
```

LIVE Studio probes upward from `49152` and binds the first available port. The chosen port may change after restart. Scan candidate endpoints in small, bounded parallel batches until one returns a valid `SERVER_HELLO`:

```txt
ws://127.0.0.1:{port}/v1/third-party
```

Close the candidate connection and continue scanning when:

- The connection fails.
- The connection times out.
- The first message is not a valid `SERVER_HELLO`.
- The `product`, `channel`, or `version` does not match this protocol.

Do not scan the 16,384-port range serially with a long timeout, and do not open it all at once. The samples use bounded concurrency and close every losing candidate socket as soon as a verified endpoint is selected.

## 2. Validate `SERVER_HELLO`

The server sends `SERVER_HELLO` immediately after the WebSocket opens:

```json
{
  "type": "SERVER_HELLO",
  "product": "tiktok_live_studio",
  "channel": "third-party-im",
  "version": "1.0.0"
}
```

Only send credentials after this message has been validated.

## 3. Send `AUTH`

The first client JSON message must be `AUTH`.

```json
{
  "type": "AUTH",
  "app_id": "your_app_id",
  "key_id": "your_key_id",
  "secret": "your_secret",
  "version": "1.0.0"
}
```

The server waits up to 20 seconds for a valid authentication message.

## 4. Handle `AUTH_RESULT`

When authentication succeeds:

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

After this point, the connection can receive `EVENT` messages.

When authentication fails, inspect `error_code` and stop using that connection.

## 5. Listen for events

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

Use `message_id` for deduplication when available.

## 6. Select gift-driven effects

When handling `live.gift`, open the [Gift Catalog](/reference/gift-catalog), copy the desired `gift.id`, and use that string as the key in your effect configuration. Do not match names or diamond values. Decide whether the effect should run immediately, once at `repeat_end=true`, or once per calculated count delta.

## 7. Reconnect safely

When the socket closes, start from service discovery again. A new WebSocket connection must repeat `SERVER_HELLO` validation and `AUTH`.

