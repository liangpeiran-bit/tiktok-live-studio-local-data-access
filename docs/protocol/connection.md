# Connection Lifecycle

Third-party clients connect to LIVE Studio through a local WebSocket endpoint.

## Endpoint

| Field | Value |
| --- | --- |
| Host | `127.0.0.1` |
| Port range | `30000` to `30015` |
| Path | `/v1/third-party` |
| Protocol version | `1.0.0` |

Full URL:

```txt
ws://127.0.0.1:{port}/v1/third-party
```

## Discovery flow

```mermaid
sequenceDiagram
  participant C as Client
  participant E as Candidate endpoint

  loop 30000 to 30015
    C->>E: Open WebSocket /v1/third-party
    alt connect failed or timed out
      C->>C: Try next port
    else connected
      E-->>C: SERVER_HELLO
      alt hello is valid
        C->>C: Stop scanning
      else hello is invalid
        C->>E: Close connection
        C->>C: Try next port
      end
    end
  end
```

Clients should validate `SERVER_HELLO` before sending credentials. A port that does not return a valid hello must be treated as unrelated.

## State machine

```mermaid
stateDiagram-v2
  [*] --> Scanning
  Scanning --> WaitingHello: WebSocket opens
  WaitingHello --> Scanning: failure / timeout / invalid hello
  WaitingHello --> Authenticating: valid hello, send AUTH
  Authenticating --> Authenticated: AUTH_RESULT success=true
  Authenticating --> Closed: auth failed or timed out
  Authenticated --> Authenticated: receive EVENT
  Authenticated --> Closed: disconnect / close / transport error
  Closed --> [*]
```

## Timeouts and heartbeat

| Setting | Value |
| --- | --- |
| Authentication timeout | 20 seconds |
| WebSocket ping interval | 30 seconds |

The protocol uses native WebSocket ping/pong. It does not define a JSON `HEARTBEAT` message.

## Reconnection

When a connection closes, its authentication state is gone. A new WebSocket must repeat:

1. Port discovery
2. `SERVER_HELLO` validation
3. `AUTH`
4. `AUTH_RESULT` handling

Use reconnect backoff to avoid hitting connection limits during policy or network failures.

