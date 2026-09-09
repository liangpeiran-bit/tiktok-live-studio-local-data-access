---
title: Playable demos
description: Games built with TikTok LIVE Studio Local Data Access
---

# See live events become gameplay

These demos use the same local WebSocket protocol documented on this site. Public demo mode uses simulated events, so anyone can understand the interaction loop without LIVE Studio or application credentials.

<DemoShowcase locale="en" />

## What the demos prove

| Capability | Tug of Trap | Candy Arena |
| --- | --- | --- |
| Game shape | Room-wide team competition | Creator-controlled rhythm battle |
| Runtime | PixiJS | React + Phaser |
| `live.chat` | Team selection and coordinated cheers | Coordinated audience assist |
| `live.like` | Player strength and team morale | Hero energy |
| `live.gift` | Shield, control, helpers, gravity | Named combat skills |

Both examples keep the gateway client separate from game rules: transport authenticates and normalizes events; the game decides what each event means.

::: tip Try safely
Open either **Try the demo** link to use simulated interactions. For real live-room data, follow the [Quick Start](/guide/quick-start) and use credentials issued for your application.
:::
