# `live.like`

`live.like` 表示直播间点赞消息。

没有合法 `message_id` 的事件不会投递。

## Payload

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `message_id` | string | 是 | 用于去重的唯一消息标识 |
| `room_id` | string | 是 | 直播间标识；不可用时为空字符串 |
| `count` | string | 是 | 本条消息携带的点赞数；不可用时为空字符串 |
| `total` | string | 是 | 累计点赞数；不可用时为空字符串 |
| `user` | object | 否 | 公开用户对象 |

## 示例

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

## 客户端注意

- 将 `count` 和 `total` 当作字符串处理。
- 用 `message_id` 做去重。
- `user` 对象可能不存在。
