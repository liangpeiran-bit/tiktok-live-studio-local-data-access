# Troubleshooting

Use this page when a local client cannot discover, authenticate, or receive events from LIVE Studio.

## Cannot find the local service

Symptoms:

- All ports from `30000` to `30015` fail.
- The WebSocket never opens.

Check:

- LIVE Studio is running.
- The client uses `127.0.0.1`, not a LAN IP or remote host.
- The path is exactly `/v1/third-party`.
- Local data access is enabled for the current environment.
- No local firewall or security tool blocks loopback WebSocket connections.

## Connected but no valid `SERVER_HELLO`

Symptoms:

- The socket opens, but the first message is missing or does not match the protocol.
- `product` or `channel` is unexpected.

Action:

- Treat this port as a non-target service.
- Close the connection.
- Continue scanning the next port.
- Do not send credentials to that connection.

Valid `SERVER_HELLO`:

```json
{
  "type": "SERVER_HELLO",
  "product": "tiktok_live_studio",
  "channel": "third-party-im",
  "version": "1.0.0"
}
```

## `INVALID_FORMAT`

The `AUTH` message is malformed.

Common causes:

- The first client JSON message is not `AUTH`.
- `app_id`, `key_id`, or `secret` is missing.
- A required field is an empty string.
- The payload is not valid JSON.

## `ACCESS_DISABLED`

Local data access is disabled by policy.

Contact the LIVE Studio integration owner to confirm that local data access is enabled for the current environment.

## `INVALID_CREDENTIALS`

The provided credential did not match the allowlist.

Check:

- `app_id` has no extra whitespace.
- `key_id` is the current key version.
- `secret` is the original raw secret, not a hash.
- The app is still included in the allowlist.

::: danger Do not log secrets
When troubleshooting credential failures, never print or upload the raw `secret`.
:::

## `CONNECTION_LIMIT`

The gateway rejected the connection because the total or per-app connection limit was reached.

Action:

- Reuse a single connection per local client.
- Close stale client processes.
- Avoid reconnect loops without backoff.

## `AUTH_TIMEOUT`

The client did not complete authentication within 20 seconds after the socket opened.

Action:

- Send `AUTH` immediately after validating `SERVER_HELLO`.
- Do not wait for another application-level prompt.
- Ensure the `AUTH` payload is sent as a JSON text message.

## Authenticated but no events

Check:

- The event is included in the allowlist.
- The live room is producing that event type.
- The client dispatches by `event` name, not by payload shape only.
- The client handles optional fields and empty fallback values.

## Received `DISCONNECT` with `reason_code=510`

`510` means the access policy changed. Typical causes:

- Local data access was disabled.
- The app credential was revoked or changed.
- The app exceeded a policy limit.
- The event or app allowlist was updated.

Action:

- Stop using the current connection.
- Refresh credentials or contact the integration owner.
- Re-run service discovery and authentication after the policy is corrected.

## Heartbeat timeout

The server uses native WebSocket ping/pong. Standard WebSocket libraries normally reply to ping automatically.

Do not implement a custom JSON `HEARTBEAT` message unless your own application layer needs one. It is not part of this protocol.

