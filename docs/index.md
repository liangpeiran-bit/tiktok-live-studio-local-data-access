---
layout: home

hero:
  text: Turn live interactions into gameplay
  tagline: Use a local WebSocket to transform likes, gifts, and chat into real-time experiences for H5, Unity, Unreal, or any game stack.
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/quick-start
    - theme: alt
      text: Protocol Reference
      link: /protocol/connection
    - theme: alt
      text: Apply for Access
      link: /apply

features:
  - title: Local WebSocket
    details: The Gateway listens only on 127.0.0.1, keeping live data on the creator device with low-latency delivery.
  - title: Controlled event access
    details: After credential authentication, a client receives only the IM message types enabled for its application.
  - title: Bring any game stack
    details: Connect H5, Unity, Unreal, or any WebSocket-capable runtime through a stable JSON event protocol.
---

<DemoShowcase locale="en" compact />

## What is this?

LIVE Studio Local Data Access is a local WebSocket gateway for trusted third-party tools running on the same machine as LIVE Studio. After authentication, a client can receive selected real-time live room events such as likes, gifts, and chat messages.

This capability is designed for local game engines, H5 overlays, Unity clients, and developer tools that need live room data without embedding directly into LIVE Studio.

::: warning Scope boundary
This is not a viewer-side overlay push API. It does not send personalized state to viewer devices and cannot make the video stream per-viewer. It only delivers authorized live room events to local clients on the creator machine.
:::

## Start here

<div class="tt-start-grid">
  <a href="/guide/quick-start">
    <b>01</b>
    <span><strong>Make your first connection</strong><small>Discover a port, authenticate, and receive your first live event by following the shortest path.</small></span>
  </a>
  <a href="/protocol/connection">
    <b>02</b>
    <span><strong>Build a reliable client</strong><small>Understand the connection lifecycle, authentication messages, heartbeats, and safe reconnects.</small></span>
  </a>
  <a href="/events/live-like">
    <b>03</b>
    <span><strong>Turn events into gameplay</strong><small>Explore like, gift, and chat events, then map gifts to the effects you want.</small></span>
  </a>
</div>

If a connection or event does not behave as expected, use the [Troubleshooting guide](/guide/troubleshooting).
