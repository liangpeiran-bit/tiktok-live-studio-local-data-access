# Protocol contract

This is the implementation contract for protocol version `1.0.0`.

## Deployment boundary

The service is local to the creator machine.

| Setting | Value |
| --- | --- |
| Host | `127.0.0.1` |
| Port range | `30000` through `30015`, inclusive |
| Path | `/v1/third-party` |
| URL | `ws://127.0.0.1:{port}/v1/third-party` |
| Protocol version | `1.0.0` |
| Authentication timeout | 20 seconds |
| Native WebSocket ping interval | 30 seconds |

Do not replace `127.0.0.1` with a LAN address, public hostname, or cloud endpoint. Do not expose or proxy this endpoint to a network.

## Discovery and message order

For each candidate port:

1. Open the candidate WebSocket with a bounded timeout.
2. Wait for the first server text message with a bounded timeout.
3. Parse it as JSON and validate all `SERVER_HELLO` identity fields.
4. If connection, timeout, parsing, or validation fails, close that socket and continue scanning.
5. Stop scanning only after a valid hello.
6. Send `AUTH` as the first client JSON message.
7. Wait for `AUTH_RESULT` before accepting events.

Never send credentials to a socket that has not produced a valid hello.

## `SERVER_HELLO`

Direction: server to client. It is sent immediately after the WebSocket opens.

```json
{
  "type": "SERVER_HELLO",
  "product": "tiktok_live_studio",
  "channel": "third-party-im",
  "version": "1.0.0"
}
```

Validate exact values for `type`, `product`, and `channel`. For `version`, accept only versions the client explicitly supports. Do not silently assume an unknown version is compatible.

## `AUTH`

Direction: client to server. It must be the first client JSON message.

```json
{
  "type": "AUTH",
  "app_id": "your_app_id",
  "key_id": "your_key_id",
  "secret": "your_raw_secret",
  "version": "1.0.0"
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `type` | string | yes | Exactly `AUTH` |
| `app_id` | string | yes | Issued application ID |
| `key_id` | string | yes | Issued key version ID |
| `secret` | string | yes | Raw issued secret; do not hash or transform |
| `version` | string | no | Client protocol version |

Do not log the serialized `AUTH` message.

## `AUTH_RESULT`

Direction: server to client.

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

| Field | Type | Required |
| --- | --- | --- |
| `type` | string | yes |
| `success` | boolean | yes |
| `app_id` | string | yes |
| `app_name` | string | no |
| `message` | string | yes |
| `server_time` | number | yes, Unix milliseconds |
| `version` | string | yes |
| `error_code` | string | only on relevant failures |

Branch program logic on `success` and `error_code`, not on human-readable `message`.

Authentication error codes:

| Code | Meaning | Retry guidance |
| --- | --- | --- |
| `INVALID_FORMAT` | Malformed JSON or AUTH contract | Fix the client; do not loop |
| `ACCESS_DISABLED` | Local access disabled | Wait for policy/user intervention |
| `INVALID_CREDENTIALS` | App, key, or secret mismatch | Refresh credentials; do not loop |
| `CONNECTION_LIMIT` | Total or per-app limit reached | Close duplicates; back off |
| `AUTH_TIMEOUT` | AUTH not accepted within 20 seconds | Fix ordering/timing; then retry |
| `SERVER_ERROR` | Local gateway failure | Back off and retry with a cap |

## `EVENT`

Direction: server to client, only after successful authentication.

```json
{
  "type": "EVENT",
  "event": "live.chat",
  "timestamp": 1786010400000,
  "payload": {}
}
```

The envelope requires `type`, string `event`, numeric millisecond `timestamp`, and object `payload`. See [events.md](events.md) for event payloads.

## `DISCONNECT`

The server may send this before intentionally closing an authenticated socket.

```json
{
  "type": "DISCONNECT",
  "app_id": "your_app_id",
  "reason_code": 510,
  "reason": "Application access policy changed",
  "timestamp": 1786010400000
}
```

Required fields are `type`, `app_id`, numeric `reason_code`, human-readable `reason`, and numeric millisecond `timestamp`. Branch program logic on `reason_code`, not `reason`.

| Code | Name | Client behavior |
| --- | --- | --- |
| `100` | `UserInitiated` | Close cleanly |
| `200` | `PeerClosed` | Reconnect only if the app still needs data |
| `201` | `ClientError` | Inspect the client failure before retrying |
| `300` | `HeartbeatTimeout` | Check event-loop stalls; back off and reconnect |
| `400` | `AuthFailed` | Use auth failure handling |
| `500` | `ServerShutdown` | Back off and rediscover later |
| `510` | `AccessPolicyChanged` | Stop automatic retry until credentials or policy change |

## Close, heartbeat, and reconnect

- The server uses native WebSocket ping/pong. Standard clients normally answer ping automatically.
- There is no protocol-level JSON `HEARTBEAT` message.
- A closed socket loses authentication state.
- Every reconnect must scan again, validate a new hello, send AUTH, and await AUTH_RESULT.
- Use cancellable exponential backoff with jitter and a reasonable cap.
- Ensure application shutdown cancels active scans, sockets, and pending reconnect timers.
