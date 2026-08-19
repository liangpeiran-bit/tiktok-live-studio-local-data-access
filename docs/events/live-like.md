# `live.like`

`live.like` represents a live room like message.

Events without a valid `message_id` are not delivered.

## Payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `message_id` | string | Yes | Unique message identifier for deduplication |
| `room_id` | string | Yes | Live room identifier, or empty string when unavailable |
| `count` | string | Yes | Like count carried by this message, or empty string when unavailable |
| `total` | string | Yes | Accumulated like count, or empty string when unavailable |
| `user` | object | No | Public user object |

## Example

```json
{
  "type": "EVENT",
  "event": "live.like",
  "timestamp": 1786010400000,
  "payload": {
    "message_id": "7520000000000000001",
    "room_id": "7520000000000000000",
    "count": "15",
    "total": "8432",
    "user": {
      "id": "7300000000000000000",
      "nickname": "Viewer",
      "display_id": "viewer_01",
      "avatar_url": "https://example.invalid/avatar.png"
    }
  }
}
```

## Client notes

- Treat `count` and `total` as strings.
- Use `message_id` for deduplication.
- The `user` object may be absent.

