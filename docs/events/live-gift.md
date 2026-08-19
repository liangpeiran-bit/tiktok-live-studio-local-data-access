# `live.gift`

`live.gift` represents a live room gift message.

## Payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `message_id` | string | Yes | Unique message identifier for deduplication |
| `room_id` | string | Yes | Live room identifier, or empty string when unavailable |
| `gift` | object | Yes | Gift information |
| `group_id` | string | Yes | Gift group identifier, or empty string when unavailable |
| `group_count` | string | Yes | Gift group count, or empty string when unavailable |
| `repeat_count` | string | Yes | Repeat count, or empty string when unavailable |
| `combo_count` | string | Yes | Combo count, or empty string when unavailable |
| `repeat_end` | boolean | Yes | Whether the repeat or combo sequence has ended |
| `user` | object | No | Public user object |

## Gift object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Gift identifier |
| `name` | string | Yes | Gift name, or empty string when unavailable |
| `type` | number | Yes | Gift type enum value, or `0` when unavailable |
| `diamond_count` | number | Yes | Diamond value per gift, or `0` when unavailable |
| `image_url` | string | Yes | Gift image URL, or empty string when unavailable |

## Example

```json
{
  "type": "EVENT",
  "event": "live.gift",
  "timestamp": 1786010400000,
  "payload": {
    "message_id": "7520000000000000002",
    "room_id": "7520000000000000000",
    "gift": {
      "id": "5655",
      "name": "Rose",
      "type": 1,
      "diamond_count": 1,
      "image_url": "https://example.invalid/gift.png"
    },
    "group_id": "group_001",
    "group_count": "1",
    "repeat_count": "3",
    "combo_count": "3",
    "repeat_end": true,
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

- Treat count fields as strings.
- Tolerate unknown gift `type` values.
- Use `repeat_end` to finalize combo presentation when needed.
- The `user` object may be absent.

