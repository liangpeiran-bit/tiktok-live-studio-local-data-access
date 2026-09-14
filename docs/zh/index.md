---
layout: home
description: 通过 LIVE Studio Data Access，将点赞、礼物和评论变成实时游戏玩法，让整个直播间一起参与。

hero:
  kicker: LIVE STUDIO / DATA ACCESS
  text: 为直播互动而生，让弹幕改变游戏
  headline:
    lead: 为直播互动而生
    lines:
      - 让弹幕
      - 改变游戏。
  tagline: 把实时点赞、礼物和评论变成游戏动作。用你熟悉的引擎，让整个直播间一起参与。
  taglineLines:
    - 把实时点赞、礼物和评论变成游戏动作。
    - 用你熟悉的引擎，让整个直播间一起参与。
  actions:
    - theme: brand
      text: 申请接入
      link: /zh/apply
    - theme: alt
      text: 开始开发
      link: /zh/guide/quick-start
---

<div class="home-editorial">

<div class="home-runtime">
  <p>引擎由你选，玩法由你定。</p>
  <ul aria-label="支持的运行环境"><li>H5 / Web</li><li>Unity</li><li>Unreal</li><li>WebSocket</li></ul>
</div>

<section class="home-section home-interactions" aria-labelledby="home-interactions">
  <header class="home-section__heading">
    <p class="home-eyebrow">从观看，到参与</p>
    <h2 id="home-interactions">让整个直播间，一起玩。</h2>
    <p>每一次互动如何改变游戏，由你来设计。</p>
  </header>
  <div class="home-mechanics">
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">点赞</span><HomeInteractionIcon name="like" /></div>
      <h3>一起点赞，一起蓄力。</h3>
      <p>让点赞积蓄能量，为团队带来加成。</p>
      <a href="/zh/events/live-like">了解点赞事件 <span aria-hidden="true">→</span></a>
    </article>
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">礼物</span><HomeInteractionIcon name="gift" /></div>
      <h3>一份礼物，改变战局。</h3>
      <p>自由选择礼物，为它定义游戏效果。</p>
      <a href="/zh/reference/gift-catalog">浏览礼物目录 <span aria-hidden="true">→</span></a>
    </article>
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">评论</span><HomeInteractionIcon name="chat" /></div>
      <h3>下一步，交给直播间。</h3>
      <p>让评论选择阵营、决定路线或发起挑战。</p>
      <a href="/zh/events/live-chat">了解评论事件 <span aria-hidden="true">→</span></a>
    </article>
  </div>
</section>

<DemoShowcase locale="zh" compact />

<section class="home-section home-connect" aria-labelledby="home-connect">
  <header class="home-section__heading">
    <p class="home-eyebrow">为你的技术栈而生</p>
    <h2 id="home-connect">接上 LIVE Studio，继续做你的游戏。</h2>
    <p>通过本机 WebSocket 接收已开放的 JSON 直播事件。保留熟悉的引擎、游戏循环，以及对玩法的完整控制。</p>
  </header>
  <ol class="home-steps">
    <li><span aria-hidden="true">01</span><h3>告诉我们，你想做什么。</h3><p>提交游戏想法与所需事件。申请通过后，开发者凭证和配置说明将通过邮箱发送给你。</p><a href="/zh/apply">申请抢先体验 <span aria-hidden="true">→</span></a></li>
    <li><span aria-hidden="true">02</span><h3>跑通第一次连接。</h3><p>将客户端与 LIVE Studio 运行在同一台设备上，发现 Gateway，再使用下发的凭证完成鉴权。</p><a href="/zh/guide/quick-start">阅读快速开始 <span aria-hidden="true">→</span></a></li>
    <li><span aria-hidden="true">03</span><h3>把下一条事件，变成玩法。</h3><p>为事件绑定游戏动作并开始测试。先从一次点赞或评论入手，再逐步完善自己的互动规则。</p><a href="/zh/samples/h5">查看 H5 接入示例 <span aria-hidden="true">→</span></a></li>
  </ol>
  <aside class="home-local-note"><strong>在主播本机运行。</strong> Gateway 只监听 127.0.0.1，并投递当前应用已开放的消息类型。它不会向观众设备推送游戏状态，也不会为不同观众生成个性化直播画面。</aside>
</section>

<section class="home-builder" aria-labelledby="home-builder">
  <div><p class="home-eyebrow">从一个想法，到第一条事件</p><h2 id="home-builder">准备好，就开始。</h2><p>自己阅读协议，或让开发 Agent 和你一起接入。</p></div>
  <nav aria-label="开发者资源"><a href="/zh/guide/quick-start">快速开始 <span aria-hidden="true">→</span></a><a href="/zh/guide/agent-skill">Agent Skill <span aria-hidden="true">→</span></a><a href="/zh/llms.txt">llms.txt <span aria-hidden="true">→</span></a></nav>
</section>

</div>
