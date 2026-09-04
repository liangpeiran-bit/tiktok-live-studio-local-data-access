# 连接生命周期

第三方客户端通过本机 WebSocket 端点连接 LIVE Studio。

## 端点

| 字段 | 值 |
| --- | --- |
| Host | `127.0.0.1` |
| 端口范围 | `49152` 到 `65535` |
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
  participant B as 候选端点批次

  loop 49152 到 65535，分批扫描
    C->>B: 小批量并发打开 WebSocket
    B-->>C: 失败、超时或返回首条消息
    C->>C: 校验每个 SERVER_HELLO
    alt 找到合法 hello
      C->>B: 关闭其他候选 Socket
      C->>C: 保留已验证连接并停止
    else 本批没有合法 hello
      C->>C: 扫描下一批
    end
  end
```

LIVE Studio 会从低到高探测该范围，并绑定第一个空闲端口。实际端口可能在重启后变化，客户端必须动态发现，不能写死或长期缓存。

该范围包含 16384 个候选端口。应小批量、有上限地并发扫描，选中合法端点后关闭其他候选连接；发送凭证前必须先校验 `SERVER_HELLO`。没有返回合法 hello 的端口应视为无关服务。不要一次打开整个端口范围。

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
