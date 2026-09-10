---
layout: home

hero:
  text: 让直播互动，实时进入你的游戏
  tagline: 通过主播本机的 WebSocket，将点赞、礼物和评论转化为 H5、Unity、Unreal 游戏中的实时玩法。
  actions:
    - theme: brand
      text: 申请接入
      link: /zh/apply
    - theme: alt
      text: 阅读开发文档
      link: /zh/guide/quick-start

features:
  - title: 本机 WebSocket
    details: Gateway 只监听 127.0.0.1，让直播数据留在主播设备内，接入简单且低延迟。
  - title: 可控事件范围
    details: 客户端完成凭证鉴权后，只会收到当前应用开放的 IM 消息类型。
  - title: 不限制游戏技术栈
    details: 使用稳定的 JSON 事件协议连接 H5、Unity、Unreal 或任意支持 WebSocket 的运行时。
---

<DemoShowcase locale="zh" compact />

## 这是什么？

LIVE Studio 本地数据开放是一个跑在主播本机上的 WebSocket 网关，面向与 LIVE Studio 同机运行的受信任第三方工具。客户端完成鉴权后，可以接收点赞、礼物、评论等选定的实时直播间事件。

该能力适用于本地游戏引擎、H5 overlay、Unity 客户端，以及需要直播间数据、但不嵌入 LIVE Studio 本身的开发者工具。

::: warning 能力边界
这不是看播侧 overlay 推送 API。它不会把个性化状态送到观众设备，也不能让直播流按人分画面。它只把已授权的直播间事件投递给主播机上的本地客户端。
:::

## 从这里开始

<div class="tt-start-grid">
  <a href="/zh/guide/quick-start">
    <b>01</b>
    <span><strong>跑通第一次连接</strong><small>发现端口、完成鉴权，并在最短路径中收到第一条直播事件。</small></span>
  </a>
  <a href="/zh/guide/agent-skill">
    <b>02</b>
    <span><strong>与开发 Agent 一起接入</strong><small>安装 Skill，或提供 llms.txt，让 Agent 在现有项目中适配协议。</small></span>
  </a>
  <a href="/zh/events/">
    <b>03</b>
    <span><strong>把事件变成玩法</strong><small>查看点赞、礼物、评论事件，并选择礼物触发对应效果。</small></span>
  </a>
</div>

遇到连接或事件问题时，前往[排障指南](/zh/guide/troubleshooting)。
