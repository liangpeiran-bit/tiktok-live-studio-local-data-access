# `live.chat`

`live.chat` 表示直播间文本评论消息。

## Payload

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `message_id` | string | 是 | 用于去重的唯一消息标识 |
| `room_id` | string | 是 | 直播间标识；不可用时为空字符串 |
| `content` | string | 是 | 评论文本内容 |
| `user` | object | 否 | 公开用户对象 |

## 示例

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

## 客户端注意

- 用 `message_id` 做去重。
- `user` 对象可能不存在。
- `content` 是纯文本，不要假设其中包含 markup。
