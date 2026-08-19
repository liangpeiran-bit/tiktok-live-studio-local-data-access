---
layout: home

hero:
  name: LIVE Studio 本地数据开放
  text: 本地实时事件开放能力
  tagline: 在主播本机通过 WebSocket，向白名单第三方应用开放直播间事件。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: 协议参考
      link: /zh/protocol/connection

features:
  - title: 仅本机传输
    details: 网关只监听 127.0.0.1，事件只对本地受信任客户端开放。
  - title: 凭证鉴权
    details: 第三方客户端必须先用 app_id、key_id 和 secret 完成鉴权，才能接收事件。
  - title: 实时直播事件
    details: 通过稳定的 JSON 协议接收 live.like、live.gift 和 live.chat 事件。
---

# 这是什么？

LIVE Studio 本地数据开放是一个跑在主播本机上的 WebSocket 网关，面向与 LIVE Studio 同机运行的受信任第三方工具。客户端完成鉴权后，可以接收点赞、礼物、评论等选定的实时直播间事件。

该能力适用于本地游戏引擎、H5 overlay、Unity 客户端，以及需要直播间数据、但不嵌入 LIVE Studio 本身的开发者工具。

::: warning 能力边界
这不是看播侧 overlay 推送 API。它不会把个性化状态送到观众设备，也不能让直播流按人分画面。它只把已授权的直播间事件投递给主播机上的本地客户端。
:::

## 从这里开始

- 新接入：阅读 [快速开始](/zh/guide/quick-start)。
- 实现客户端：从 [连接生命周期](/zh/protocol/connection) 和 [鉴权](/zh/protocol/auth) 开始。
- 处理事件数据：阅读 [事件信封](/zh/protocol/events) 和 [事件参考](/zh/events/live-like)。
- 排障：使用 [排障](/zh/guide/troubleshooting)。
