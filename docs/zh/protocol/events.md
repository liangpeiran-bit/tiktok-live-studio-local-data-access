# 事件信封

鉴权成功后，LIVE Studio 使用 `EVENT` 信封发送公开直播间事件。

## 信封结构

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | 固定为 `EVENT` |
| `event` | string | 是 | 公开事件名 |
| `timestamp` | number | 是 | Unix 时间戳，毫秒 |
| `payload` | object | 是 | 事件专属 payload |

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

## 公开用户对象

部分事件 payload 会包含 `user` 对象。该对象本身以及其中所有字段都应视为可选。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 否 | 用户标识 |
| `nickname` | string | 否 | 展示昵称 |
| `display_id` | string | 否 | 公开展示 ID |
| `avatar_url` | string | 否 | 头像 URL |

示例：

```json
{
  "id": "7300000000000000000",
  "nickname": "Viewer",
  "display_id": "viewer_01",
  "avatar_url": "https://example.invalid/avatar.png"
}
```

## 去重

payload 包含 `message_id` 时，用它作为主去重键。

推荐键：

```txt
{event}:{message_id}
```

## 可选字段

客户端不要假设每个字段都存在。LIVE Studio 可能省略不可用字段，或给出空字符串、`0` 等安全回退值。

推荐处理方式：

- 将 `user` 视为可选。
- 将未知事件名视为不支持并忽略。
- 容忍未知枚举值。
- 不要因为某个事件 payload 缺少可选字段就断开整条连接。
