# Tower Defense × LIVE Studio

A recorded interaction case: a gift becomes a tower and changes the round inside LIVE Studio. This is a video, not a playable demo or a downloadable game project.

<video class="tt-case-video" controls playsinline preload="none" poster="/media/interactive-tower-defense-demo.webp" aria-label="Tower Defense gameplay recording">
  <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
</video>

[Open the recording](/media/interactive-tower-defense-demo.mp4).

## Bring the pattern to your game

| Audience input | Game responsibility |
| --- | --- |
| A gift event arrives | Match the string `payload.gift.id` to your chosen rule. |
| The chosen trigger condition is met | Spawn a tower or run another action your game defines. |
| An unknown gift arrives | Ignore it or use an explicit fallback; keep the connection open. |

The recording illustrates the interaction, not a specification of its internal implementation. To build a similar effect, start with [live.gift](/events/live-gift) and the [Gift Catalog](/reference/gift-catalog). Decide your combo policy before attaching an expensive action.

For a hands-on simulation, try [Tug of Trap](/demos/tug-of-trap) or [Candy Arena](/demos/candy-arena-duel). To receive real events, follow [Quick Start](/guide/quick-start).
