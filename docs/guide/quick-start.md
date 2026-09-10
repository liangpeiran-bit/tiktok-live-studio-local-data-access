# Quick Start

The goal is one authenticated connection and one real event. You do not need to build a game first.

## 1. Check your access

**Not approved yet?** [Apply for access](/apply). You can explore [simulated demos](/demos/) while waiting; they do not grant access to real live-room data.

**Already approved?** Have these ready:

- LIVE Studio running on the **same machine** as your client.
- The installation and account enabled for local data access, as described in your approval email.
- Your issued `app_id`, `key_id`, and `secret`.

There is no verified public minimum LIVE Studio build listed here yet. Use the setup instructions supplied with your approval; updating LIVE Studio alone does not enable access. If those instructions or credentials are missing, email [liangpeiran@bytedance.com](mailto:liangpeiran@bytedance.com).

## 2. Run the local starter

Follow [H5: runnable starter](/samples/h5) to download three small files and launch them on `127.0.0.1`. It requires Node.js 22+ for the local preview server and a browser that permits local WebSocket access.

Enter your credentials at runtime, then select **Connect**. Do not enter credentials on public demo pages or put them in downloaded source files.

Expected status:

```text
SCANNING → AUTHENTICATING → AUTHENTICATED
```

The client scans `49152–65535` in bounded batches, verifies `SERVER_HELLO`, and sends `AUTH`. **AUTHENTICATED** appears only after `AUTH_RESULT.success=true`.

## 3. Receive the first event

With a live room active, generate an interaction for a message type enabled on your application. Start with a like or comment if enabled; a gift purchase is not required to test the connection.

The local log will show, for example:

```text
EVENT live.like
```

This is expected output, not a simulated event injected by the starter. An idle live room may produce no events, and authentication does not enable every message type.

| What you see | What to check |
| --- | --- |
| `ENDPOINT_NOT_FOUND` | Same machine, enabled LIVE Studio installation/account, and browser local-network policy. |
| `INVALID_CREDENTIALS` or `ACCESS_DISABLED` | Issued credentials and application configuration; do not retry in a tight loop. |
| `AUTHENTICATED`, but no event | Active room, a new interaction, and the enabled IM message types. |
| `POLICY_DISCONNECT_510` | Access policy changed. Stop and confirm access before reconnecting. |

More checks: [Troubleshooting](/guide/troubleshooting).

## 4. Make it your game

Choose an [event](/events/) and connect its handler to a game action. For gifts, copy a string ID from the [Gift Catalog](/reference/gift-catalog#browse-gifts) and choose when a combo triggers the effect.

Keep transport separate from game rules. The starter has manual reconnect, not production retry logic; each new connection must rediscover and authenticate. For production, add cancellable backoff as described in [Connection lifecycle](/protocol/connection).

Prefer to work with an agent? [Install the Agent Skill](/guide/agent-skill), or give it [llms.txt](/llms.txt). For Unity, use the [integration guide](/samples/unity).

::: warning Credential handling
Never log or upload the secret, embed it in a public bundle, or commit it to a repository. This starter keeps it in memory. A packaged client should use its trusted runtime credential mechanism or an OS secret store, not plaintext project files.
:::

