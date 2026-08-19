# 连接生命周期

第三方客户端通过本机 WebSocket 端点连接 LIVE Studio。

## 端点

| 字段 | 值 |
| --- | --- |
| Host | `127.0.0.1` |
| 端口范围 | `30000` 到 `30015` |
| Path | `/v1/third-party` |
| 协议版本 | `1.0.0` |

完整 URL：

```txt
ws://127.0.0.1:{port}/v1/third-party
```

## 服务发现流程

```mermaid
sequenceDiagram
  participant C as 客户端
  participant E as 候选端点

  loop 30000 到 30015
    C->>E: 打开 WebSocket /v1/third-party
    alt 连接失败或超时
      C->>C: 尝试下一个端口
    else 已连接
      E-->>C: SERVER_HELLO
      alt hello 合法
        C->>C: 停止扫描
      else hello 不合法
        C->>E: 关闭连接
        C->>C: 尝试下一个端口
      end
    end
  end
```

发送凭证前必须先校验 `SERVER_HELLO`。没有返回合法 hello 的端口应视为无关服务。

## 状态机

```mermaid
stateDiagram-v2
  [*] --> Scanning
  Scanning --> WaitingHello: WebSocket 打开
  WaitingHello --> Scanning: 失败 / 超时 / hello 不合法
  WaitingHello --> Authenticating: hello 合法，发送 AUTH
  Authenticating --> Authenticated: AUTH_RESULT success=true
  Authenticating --> Closed: 鉴权失败或超时
  Authenticated --> Authenticated: 接收 EVENT
  Authenticated --> Closed: 断开 / 关闭 / 传输错误
  Closed --> [*]
```

## 超时与心跳

| 配置 | 值 |
| --- | --- |
| 鉴权超时 | 20 秒 |
| WebSocket ping 间隔 | 30 秒 |

协议使用原生 WebSocket ping/pong，不定义 JSON `HEARTBEAT` 消息。

## 重连

连接关闭后，鉴权状态随之失效。新的 WebSocket 必须重新完成：

1. 端口发现
2. `SERVER_HELLO` 校验
3. `AUTH`
4. `AUTH_RESULT` 处理

请使用重连退避，避免在策略或网络故障期间打满连接上限。
