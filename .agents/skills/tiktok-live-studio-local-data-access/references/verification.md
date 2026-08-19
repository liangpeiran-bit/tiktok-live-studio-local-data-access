# Verification checklist

Use the project's existing test framework and commands. A mock WebSocket server should emulate the protocol without using real credentials.

## Automated cases

At minimum, verify:

- Discovery skips connection failures, timeouts, non-JSON first messages, and invalid hello identity fields.
- Credentials are never sent to an endpoint with an invalid hello.
- `AUTH` is the first client JSON message after a valid hello.
- Events are not delivered to application handlers before `AUTH_RESULT.success=true`.
- Each documented auth error reaches the intended retry or intervention branch.
- `live.like`, `live.gift`, and `live.chat` preserve documented field types.
- Missing `user` and missing optional user fields are accepted.
- Unknown events and unknown gift type values do not close the connection.
- Duplicate `{event}:{message_id}` values are suppressed within the cache window.
- Chat content is rendered or forwarded as plain text, not executable markup.
- A malformed event is isolated without killing the receive loop.
- Socket close causes a fresh discovery and authentication cycle.
- Repeated failures use backoff rather than a tight loop.
- Reason `510` stops automatic retry pending intervention.
- Shutdown cancels discovery, receive work, active sockets, and retry timers.
- Starting twice does not create two active connections.

## Security review

Search the changed files and test snapshots for:

- real or placeholder-like production credentials;
- logging of AUTH payloads, secrets, or configuration objects containing secrets;
- secrets embedded in browser bundles, checked-in config, URLs, query strings, telemetry, or exception text;
- credentials sent before exact hello validation;
- a remote proxy, non-loopback binding, or advice to expose the service to a network.

## Quality commands

Run the narrowest relevant commands first, followed by the project's normal build/type-check/lint/test commands in proportion to the change. Use the repository's required package manager and task runner.

Do not claim that a build or test passed unless its command completed successfully.

## Optional live smoke test

Run only when TikTok LIVE Studio and approved credentials are available on the same machine.

1. Supply credentials through the project's secure runtime mechanism.
2. Start the client and confirm it finds a valid hello.
3. Confirm successful authentication without printing credentials.
4. Trigger one enabled event and confirm exactly one application action.
5. Stop/restart the local service and confirm rediscovery plus reauthentication.
6. Remove credentials and diagnostic artifacts after the test when appropriate.

Record whether testing was mock-only or included a live smoke test.
