# Event Envelope

After authentication succeeds, LIVE Studio sends public live room events using the `EVENT` envelope.

## Envelope shape

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string | Yes | Always `EVENT` |
| `event` | string | Yes | Public event name |
| `timestamp` | number | Yes | Unix timestamp in milliseconds |
| `payload` | object | Yes | Event-specific payload |

```json
{
  "type": "EVENT",
  "event": "live.like",
  "timestamp": 1786010400000,
  "payload": {
    "message_id": "7520000000000000001"
  }
}
```

## Public user object

Some event payloads include a `user` object. The object itself and all fields inside it should be treated as optional.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | No | User identifier |
| `nickname` | string | No | Display nickname |
| `display_id` | string | No | Public display ID |
| `avatar_url` | string | No | Avatar URL |

Example:

```json
{
  "id": "7300000000000000000",
  "nickname": "Viewer",
  "display_id": "viewer_01",
  "avatar_url": "https://example.invalid/avatar.png"
}
```

## Deduplication

When a payload includes `message_id`, use it as the primary deduplication key.

Recommended key:

```txt
{event}:{message_id}
```

## Optional fields

Clients should not assume every field is present. LIVE Studio may omit unavailable fields, or provide safe fallback values such as an empty string or `0`.

Recommended handling:

- Treat `user` as optional.
- Treat unknown event names as unsupported and ignore them.
- Tolerate unknown enum values.
- Avoid failing the entire connection because one event payload is missing an optional field.

