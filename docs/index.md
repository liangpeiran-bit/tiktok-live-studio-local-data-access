---
layout: home
description: Build games the whole live room can play. Connect likes, gifts, and chat to your game with LIVE Studio Data Access.

hero:
  kicker: LIVE STUDIO / DATA ACCESS
  text: Build for the moment the chat changes the game.
  headline:
    lead: Build for the moment
    lines:
      - THE CHAT
      - CHANGES
      - THE GAME.
  tagline: Turn live likes, gifts, and chat into game actions. Your engine. Your rules. A whole room playing along.
  taglineLines:
    - Turn live likes, gifts, and chat into game actions.
    - Your engine. Your rules. A whole room playing along.
  actions:
    - theme: brand
      text: Apply for access
      link: /apply
    - theme: alt
      text: Start building
      link: /guide/quick-start
---

<div class="home-editorial">

<div class="home-runtime">
  <p>Your engine. Your rules.</p>
  <ul aria-label="Compatible runtimes"><li>H5 / Web</li><li>Unity</li><li>Unreal</li><li>WebSocket</li></ul>
</div>

<section class="home-section home-interactions" aria-labelledby="home-interactions">
  <header class="home-section__heading">
    <p class="home-eyebrow">FROM AUDIENCE TO PLAYERS</p>
    <h2 id="home-interactions">Give the room a way to play.</h2>
    <p>You choose how each interaction changes the game.</p>
  </header>
  <div class="home-mechanics">
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">LIKES</span><HomeInteractionIcon name="like" /></div>
      <h3>Build momentum.</h3>
      <p>Likes charge energy and power up teams.</p>
      <a href="/events/live-like">Explore like events <span aria-hidden="true">→</span></a>
    </article>
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">GIFTS</span><HomeInteractionIcon name="gift" /></div>
      <h3>Change the round.</h3>
      <p>Choose a gift. Define its game effect.</p>
      <a href="/reference/gift-catalog">Browse the gift catalog <span aria-hidden="true">→</span></a>
    </article>
    <article>
      <div class="home-mechanics__top"><span class="home-mechanics__label">CHAT</span><HomeInteractionIcon name="chat" /></div>
      <h3>Call the next move.</h3>
      <p>Let chat pick teams, routes, or challenges.</p>
      <a href="/events/live-chat">Explore chat events <span aria-hidden="true">→</span></a>
    </article>
  </div>
</section>

<DemoShowcase locale="en" compact />

<section class="home-section home-connect" aria-labelledby="home-connect">
  <header class="home-section__heading">
    <p class="home-eyebrow">BUILT FOR YOUR STACK</p>
    <h2 id="home-connect">Your game, connected to LIVE Studio.</h2>
    <p>A local WebSocket delivers enabled live events as JSON. Keep your engine, your game loop, and your creative control.</p>
  </header>
  <ol class="home-steps">
    <li><span aria-hidden="true">01</span><h3>Tell us what you’re building.</h3><p>Apply with your game idea and the events you need. Approved developers receive credentials and setup instructions by email.</p><a href="/apply">Request early access <span aria-hidden="true">→</span></a></li>
    <li><span aria-hidden="true">02</span><h3>Make your first connection.</h3><p>Run your client on the same machine as LIVE Studio, discover the Gateway, and authenticate with your issued credentials.</p><a href="/guide/quick-start">Follow the quick start <span aria-hidden="true">→</span></a></li>
    <li><span aria-hidden="true">03</span><h3>Make the next event playable.</h3><p>Map an event to an action and test it in your game. Start with a like or comment, then build out your own rules.</p><a href="/samples/h5">Explore the H5 starter <span aria-hidden="true">→</span></a></li>
  </ol>
  <aside class="home-local-note"><strong>Local by design.</strong> The Gateway listens on 127.0.0.1 and delivers the message types enabled for your application. It does not push game state to viewer devices or personalize the live video.</aside>
</section>

<section class="home-builder" aria-labelledby="home-builder">
  <div><p class="home-eyebrow">FROM IDEA TO FIRST EVENT</p><h2 id="home-builder">Ready when you are.</h2><p>Explore the protocol yourself, or bring your coding agent.</p></div>
  <nav aria-label="Developer resources"><a href="/guide/quick-start">Quick start <span aria-hidden="true">→</span></a><a href="/guide/agent-skill">Agent Skill <span aria-hidden="true">→</span></a><a href="/llms.txt">llms.txt <span aria-hidden="true">→</span></a></nav>
</section>

</div>
