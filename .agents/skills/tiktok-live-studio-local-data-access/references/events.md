# Event contracts

Events arrive inside the authenticated `EVENT` envelope.

## Common envelope

```json
{
  "type": "EVENT",
  "event": "live.like",
  "timestamp": 1786010400000,
  "payload": {}
}
```

Dispatch by `event`. Ignore unknown event names without closing the connection.

When `payload.message_id` exists, the recommended deduplication key is:

```text
{event}:{message_id}
```

Choose a bounded cache with expiration so a long-running client does not leak memory.

## Public user

The `user` object is optional. Every nested field is also optional.

| Field | Type |
| --- | --- |
| `id` | string |
| `nickname` | string |
| `display_id` | string |
| `avatar_url` | string |

Do not reject an otherwise valid event because `user` or one of these fields is absent.

## `live.like`

| Payload field | Type | Required | Notes |
| --- | --- | --- | --- |
| `message_id` | string | yes | Deduplication ID; invalid IDs are not delivered |
| `room_id` | string | yes | May be empty |
| `count` | string | yes | Per-message count; may be empty |
| `total` | string | yes | Accumulated count; may be empty |
| `user` | object | no | Public user |

Keep `count` and `total` as strings at the protocol boundary. If the domain needs numbers, parse them with checked conversion and retain a safe fallback.

## `live.gift`

| Payload field | Type | Required | Notes |
| --- | --- | --- | --- |
| `message_id` | string | yes | Deduplication ID |
| `room_id` | string | yes | May be empty |
| `gift` | object | yes | Gift data |
| `group_id` | string | yes | May be empty |
| `group_count` | string | yes | May be empty |
| `repeat_count` | string | yes | May be empty |
| `combo_count` | string | yes | May be empty |
| `repeat_end` | boolean | yes | Combo/repeat completion |
| `user` | object | no | Public user |

Gift object:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Gift ID |
| `name` | string | yes | May be empty |
| `type` | number | yes | May be `0`; tolerate unknown enum values |
| `diamond_count` | number | yes | Per-gift value; may be `0` |
| `image_url` | string | yes | May be empty |

All gift count fields documented as strings must remain strings at the protocol boundary. Use `repeat_end` when the application needs to finalize combo presentation.

## `live.chat`

| Payload field | Type | Required | Notes |
| --- | --- | --- | --- |
| `message_id` | string | yes | Deduplication ID |
| `room_id` | string | yes | May be empty |
| `content` | string | yes | Untrusted plain text |
| `user` | object | no | Public user |

Render `content` as text. Escape or sanitize it before inserting it into HTML, rich text, command interpreters, logs, or overlays.

## Compatibility rules

- Validate fields needed for the application's action, but do not crash the connection on one malformed event.
- Tolerate extra object fields for forward compatibility.
- Tolerate unknown enum values.
- Keep transport DTOs separate from stricter domain models when the application needs stronger invariants.
- Do not invent undocumented event names or payload fields.
