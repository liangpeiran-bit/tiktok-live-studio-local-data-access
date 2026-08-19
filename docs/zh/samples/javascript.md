# JavaScript / TypeScript 示例

本示例展示核心客户端流程：

1. 扫描端口。
2. 校验 `SERVER_HELLO`。
3. 发送 `AUTH`。
4. 分发 `EVENT` 消息。

## 最小客户端

```ts
type ServerHello = {
  type: 'SERVER_HELLO'
  product: 'tiktok_live_studio'
  channel: 'third-party-im'
  version: string
}

type AuthResult = {
  type: 'AUTH_RESULT'
  success: boolean
  app_id: string
  app_name?: string
  message: string
  server_time: number
  version: string
  error_code?: string
}

type EventEnvelope = {
  type: 'EVENT'
  event: string
  timestamp: number
  payload: Record<string, unknown>
}

type Credentials = {
  appId: string
  keyId: string
  secret: string
}

const PORT_START = 30000
const PORT_END = 30015
const PATH = '/v1/third-party'

function isValidHello(value: unknown): value is ServerHello {
  const hello = value as Partial<ServerHello>
  return (
    hello.type === 'SERVER_HELLO' &&
    hello.product === 'tiktok_live_studio' &&
    hello.channel === 'third-party-im' &&
    typeof hello.version === 'string'
  )
}

function waitForFirstMessage(socket: WebSocket, timeoutMs = 3000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('SERVER_HELLO timeout')), timeoutMs)

    socket.addEventListener(
      'message',
      (event) => {
        clearTimeout(timer)
        try {
          resolve(JSON.parse(String(event.data)))
        } catch (error) {
          reject(error)
        }
      },
      { once: true }
    )

    socket.addEventListener('error', () => reject(new Error('WebSocket error')), { once: true })
  })
}

async function connectCandidate(port: number): Promise<WebSocket | null> {
  const socket = new WebSocket(`ws://127.0.0.1:${port}${PATH}`)

  try {
    const firstMessage = await waitForFirstMessage(socket)
    if (!isValidHello(firstMessage)) {
      socket.close()
      return null
    }
    return socket
  } catch {
    socket.close()
    return null
  }
}

export async function connectLiveStudio(credentials: Credentials): Promise<WebSocket> {
  for (let port = PORT_START; port <= PORT_END; port += 1) {
    const socket = await connectCandidate(port)
    if (!socket) continue

    socket.send(
      JSON.stringify({
        type: 'AUTH',
        app_id: credentials.appId,
        key_id: credentials.keyId,
        secret: credentials.secret,
        version: '1.0.0'
      })
    )

    return socket
  }

  throw new Error('LIVE Studio Local Data Access endpoint not found')
}
```

## 分发消息

```ts
const socket = await connectLiveStudio({
  appId: 'your_app_id',
  keyId: 'your_key_id',
  secret: 'your_secret'
})

socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data)) as AuthResult | EventEnvelope

  if (message.type === 'AUTH_RESULT') {
    if (!message.success) {
      console.error('Authentication failed:', message.error_code, message.message)
      socket.close()
    }
    return
  }

  if (message.type === 'EVENT') {
    switch (message.event) {
      case 'live.like':
        console.log('like', message.payload)
        break
      case 'live.gift':
        console.log('gift', message.payload)
        break
      case 'live.chat':
        console.log('chat', message.payload)
        break
      default:
        console.warn('Unsupported event:', message.event)
    }
  }
})
```

## 生产注意

- 增加重连退避。
- 存在 `message_id` 时，用 `{event}:{payload.message_id}` 去重。
- 永远不要记录原始 `secret`。
- 将 `user` 及其内部字段全部视为可选。
