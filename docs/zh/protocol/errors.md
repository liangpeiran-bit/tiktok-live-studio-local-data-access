# 错误码与断开

本页列出鉴权错误和应用层断开原因。

## 鉴权错误

鉴权失败会写在 `AUTH_RESULT.error_code` 中。

| `error_code` | 含义 | 常见原因 |
| --- | --- | --- |
| `INVALID_FORMAT` | 鉴权消息格式无效 | JSON 非法、缺少 `type`、客户端第一条消息不是 `AUTH`，或缺少 `app_id`、`key_id`、`secret` |
| `ACCESS_DISABLED` | 本地数据开放已关闭 | 本地数据开放策略未开启 |
| `INVALID_CREDENTIALS` | 凭证不匹配 | 应用不在白名单、`key_id` 错误，或 `secret` 不匹配 |
| `CONNECTION_LIMIT` | 达到连接上限 | 总连接数或单应用配额超限 |
| `AUTH_TIMEOUT` | 鉴权超时 | 客户端未在 20 秒内发送合法 `AUTH` |
| `SERVER_ERROR` | 服务端内部错误 | 本机网关出现非预期错误 |

## 断开消息

LIVE Studio 主动终止已鉴权连接时，可能在关闭 WebSocket 前发送 `DISCONNECT`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | string | 是 | 固定为 `DISCONNECT` |
| `app_id` | string | 是 | 已鉴权的应用标识 |
| `reason_code` | number | 是 | 应用层原因码 |
| `reason` | string | 是 | 可读原因说明 |
| `timestamp` | number | 是 | Unix 时间戳，毫秒 |

```json
{
  "type": "DISCONNECT",
  "app_id": "your_app_id",
  "reason_code": 510,
  "reason": "Application access policy changed",
  "timestamp": 1786010400000
}
```

## 断开原因码

| `reason_code` | 名称 | 说明 |
| --- | --- | --- |
| `100` | `UserInitiated` | 服务端收到主动停止请求 |
| `200` | `PeerClosed` | 对端已经关闭 socket |
| `201` | `ClientError` | 客户端传输或消息错误 |
| `300` | `HeartbeatTimeout` | 服务端未收到 WebSocket pong |
| `400` | `AuthFailed` | 鉴权失败 |
| `500` | `ServerShutdown` | LIVE Studio 本地事件服务正在停止 |
| `510` | `AccessPolicyChanged` | 接入关闭、凭证撤销、白名单变更或配额策略变更 |

## 客户端行为

- 用 `error_code` 做鉴权失败分支。
- 用 `reason_code` 做断开处理。
- 不要把 `message` 或 `reason` 当作唯一的程序信号。
- 新连接必须重新做服务发现和鉴权。
- 连续失败后使用重连退避。
