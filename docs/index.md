---
layout: home

hero:
  name: LIVE Studio Local Data Access
  text: Local real-time event access
  tagline: Open live room events to allowlisted third-party apps on the creator machine over WebSocket.
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: Protocol Reference
      link: /protocol/connection

features:
  - title: Local-only transport
    details: The gateway listens on 127.0.0.1 and exposes events only to local trusted clients.
  - title: Authorized access
    details: Third-party clients authenticate with app_id, key_id, and secret before receiving events.
  - title: Real-time live events
    details: Receive live.like, live.gift, and live.chat events through a stable JSON protocol.
---

# What is this?

LIVE Studio Local Data Access is a local WebSocket gateway for trusted third-party tools running on the same machine as LIVE Studio. After authentication, a client can receive selected real-time live room events such as likes, gifts, and chat messages.

This capability is designed for local game engines, H5 overlays, Unity clients, and developer tools that need live room data without embedding directly into LIVE Studio.

::: warning Scope boundary
This is not a viewer-side overlay push API. It does not send personalized state to viewer devices and cannot make the video stream per-viewer. It only delivers authorized live room events to local clients on the creator machine.
:::

## Start here

- New integration: read [Quick Start](/guide/quick-start).
- Implementing a client: start from [Connection Lifecycle](/protocol/connection) and [Authentication](/protocol/auth).
- Handling event data: read [Event Envelope](/protocol/events) and the [Events](/events/live-like) reference.
- Debugging failures: use [Troubleshooting](/guide/troubleshooting).
