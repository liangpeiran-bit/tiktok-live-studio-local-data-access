# Technology-stack adaptation

The protocol is stack-independent. Adapt its state machine to the project's existing runtime instead of translating one sample line by line.

## Selection rules

1. Reuse the project's current WebSocket client or platform API when it supports text messages, close/error handling, cancellation, and native ping/pong.
2. Match the existing synchronous, callback, promise, coroutine, task, or async-stream model.
3. Keep socket I/O off UI or game render loops.
4. Marshal domain/UI work onto the framework's required main thread.
5. Make shutdown explicit and idempotent.
6. Use the project's dependency manager and quality commands. Do not introduce a second package manager.

## Browser and H5 overlays

- A browser page can connect only when it runs on the creator machine and browser policy permits `ws://127.0.0.1`.
- Use the native `WebSocket` API unless the application already has a wrapper.
- Browser JavaScript cannot control native ping/pong; the browser handles it.
- Never compile real `app_id`, `key_id`, or `secret` into a public/static bundle.
- Render chat with `textContent` or the framework's escaped text binding, not raw HTML.
- Close the socket and cancel retries when the page or component is disposed.

If secure runtime credential delivery is impossible, recommend a trusted local desktop/service host instead of weakening credential handling.

## Node.js and Electron

- Prefer the runtime's supported WebSocket implementation or an existing project library.
- In Electron, keep the connection in a long-lived main/service process rather than a remounting renderer component.
- Expose a narrow, validated IPC event surface to renderers. Never forward the secret.
- Tie retry cancellation to application shutdown and prevent multiple windows from creating duplicate connections.

## .NET desktop and Unity

- Prefer `ClientWebSocket` when compatible with the target runtime; otherwise reuse the project's established Unity WebSocket package.
- Run connect/receive loops in cancellable tasks or coroutines without blocking the game loop.
- Marshal Unity object, scene, and UI updates onto Unity's main thread.
- Own the connection in a persistent service or object and avoid reconnecting from `Update()`.
- Cancel and dispose on application quit, domain reload, or owner teardown.

## Java and Kotlin

- Prefer the platform HTTP/WebSocket client or an existing OkHttp-style dependency.
- Use the project's executor, coroutine scope, or lifecycle owner.
- Serialize state transitions so callbacks cannot create two authenticated sockets.
- Cancel callbacks and retry jobs when the owner stops.

## Python

- Reuse the project's sync or async WebSocket library; do not mix event-loop models.
- In async applications, make scan, receive, and backoff cancellation-aware.
- In GUI applications, forward events to the toolkit's main/UI thread.
- Avoid logging exception objects that embed request payloads or credentials.

## Go

- Reuse the project's WebSocket library and `context.Context` cancellation pattern.
- Give one goroutine ownership of connection state or protect transitions explicitly.
- Stop read loops and retry timers when the context is canceled.
- Bound deduplication storage and avoid goroutine leaks during repeated discovery.

## Rust

- Match the project's existing async runtime; do not add a second runtime solely for WebSockets.
- Model connection state with enums and use cancellation/drop semantics consistently.
- Avoid holding locks while awaiting socket operations or backoff timers.
- Keep secret values out of `Debug` output and error contexts.

## C++ and Unreal Engine

- Prefer the engine/framework WebSocket module already enabled by the project.
- Bind callbacks with lifetime-safe weak references and unbind on shutdown.
- Dispatch gameplay and UI work to the game thread.
- Keep discovery/reconnect logic out of tick functions and prevent stale callbacks from previous sockets.

## Other stacks

For any other runtime, map the same responsibilities:

| Protocol concern | Runtime capability needed |
| --- | --- |
| Port discovery | Cancellable sequential or bounded-concurrency connection attempts |
| Hello validation | Text frame reception, JSON parsing, deadline |
| Authentication | Ordered text send after validation |
| Event loop | Long-lived receive callback/stream/task |
| Native heartbeat | Standards-compliant WebSocket ping/pong |
| Reconnect | Cancellation-aware timer with backoff and jitter |
| App integration | Safe thread/executor/lifecycle handoff |
| Secret handling | Runtime configuration or OS/project secret store |

If the runtime cannot meet one of these requirements, surface the limitation before implementation rather than weakening the protocol.
