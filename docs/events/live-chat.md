# `live.chat`

`live.chat` represents a live room text chat message.

## Payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `message_id` | string | Yes | Unique message identifier for deduplication |
| `room_id` | string | Yes | Live room identifier, or empty string when unavailable |
| `content` | string | Yes | Chat text content |
| `user` | object | No | Public user object |

## Example

```json
{
  "type": "EVENT",
  "event": "live.chat",
  "timestamp": 1786010400000,
  "payload": {
    "message_id": "7520000000000000002",
    "room_id": "7520000000000000000",
    "content": "hello live",
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

- Use `message_id` for deduplication.
- The `user` object may be absent.
- `content` is plain text. Do not assume it contains markup.

