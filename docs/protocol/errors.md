# Errors and Disconnects

This page lists authentication errors and application-level disconnect reasons.

## Authentication errors

Authentication failures are returned in `AUTH_RESULT.error_code`.

| `error_code` | Meaning | Common cause |
| --- | --- | --- |
| `INVALID_FORMAT` | Invalid authentication message | Invalid JSON, missing `type`, first client message is not `AUTH`, or missing `app_id`, `key_id`, or `secret` |
| `ACCESS_DISABLED` | Local data access is disabled | The local data access policy is not enabled |
| `INVALID_CREDENTIALS` | Credential mismatch | App is not allowlisted, `key_id` is wrong, or `secret` does not match |
| `CONNECTION_LIMIT` | Connection limit reached | Total or per-app connection quota exceeded |
| `AUTH_TIMEOUT` | Authentication timed out | Client did not send a valid `AUTH` within 20 seconds |
| `SERVER_ERROR` | Internal server error | Unexpected local gateway error |

## Disconnect message

When LIVE Studio intentionally terminates an authenticated connection, it may send `DISCONNECT` before closing the WebSocket.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | Always `DISCONNECT` |
| `app_id` | string | Yes | Authenticated application identifier |
| `reason_code` | number | Yes | Application-level reason code |
| `reason` | string | Yes | Human-readable reason |
| `timestamp` | number | Yes | Unix timestamp in milliseconds |

```json
{
  "type": "DISCONNECT",
  "app_id": "your_app_id",
  "reason_code": 510,
  "reason": "Application access policy changed",
  "timestamp": 1786010400000
}
```

## Disconnect reason codes

| `reason_code` | Name | Description |
| --- | --- | --- |
| `100` | `UserInitiated` | Server received an intentional stop request |
| `200` | `PeerClosed` | Peer already closed the socket |
| `201` | `ClientError` | Client-side transport or message error |
| `300` | `HeartbeatTimeout` | Server did not receive WebSocket pong |
| `400` | `AuthFailed` | Authentication failed |
| `500` | `ServerShutdown` | LIVE Studio local event service is stopping |
| `510` | `AccessPolicyChanged` | Access disabled, credential revoked, allowlist changed, or quota policy changed |

## Client behavior

- Use `error_code` for authentication failure branching.
- Use `reason_code` for disconnect handling.
- Do not parse `message` or `reason` as the only programmatic signal.
- Re-run service discovery and authentication for a new connection.
- Apply reconnect backoff after repeated failures.

