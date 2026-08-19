# `live.gift`

`live.gift` 表示直播间礼物消息。

## Payload

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `message_id` | string | 是 | 用于去重的唯一消息标识 |
| `room_id` | string | 是 | 直播间标识；不可用时为空字符串 |
| `gift` | object | 是 | 礼物信息 |
| `group_id` | string | 是 | 礼物分组标识；不可用时为空字符串 |
| `group_count` | string | 是 | 礼物分组数量；不可用时为空字符串 |
| `repeat_count` | string | 是 | 连击次数；不可用时为空字符串 |
| `combo_count` | string | 是 | combo 次数；不可用时为空字符串 |
| `repeat_end` | boolean | 是 | 连击或 combo 序列是否已结束 |
| `user` | object | 否 | 公开用户对象 |

## Gift 对象

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 礼物标识 |
| `name` | string | 是 | 礼物名称；不可用时为空字符串 |
| `type` | number | 是 | 礼物类型枚举值；不可用时为 `0` |
| `diamond_count` | number | 是 | 单个礼物的钻石价值；不可用时为 `0` |
| `image_url` | string | 是 | 礼物图片 URL；不可用时为空字符串 |

## 示例

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

## 客户端注意

- 将计数字段当作字符串处理。
- 容忍未知的礼物 `type` 值。
- 需要收尾 combo 展示时，使用 `repeat_end`。
- `user` 对象可能不存在。
