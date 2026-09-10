# Tower Defense × LIVE Studio

一段录制的互动案例：礼物变成防御塔，实时改变 LIVE Studio 中的战局。这是视频，不是在线试玩，也不提供可下载的游戏工程。

<video class="tt-case-video" controls playsinline preload="none" poster="/media/interactive-tower-defense-demo.webp" aria-label="塔防玩法录制演示">
  <source src="/media/interactive-tower-defense-demo.mp4" type="video/mp4" />
</video>

[直接打开录制视频](/media/interactive-tower-defense-demo.mp4)。

## 在你的游戏中实现类似玩法

| 观众输入 | 游戏负责什么 |
| --- | --- |
| 收到礼物事件 | 按字符串 `payload.gift.id` 匹配自己配置的规则。 |
| 满足选定的触发条件 | 生成防御塔，或执行游戏定义的其他动作。 |
| 收到未知礼物 | 忽略或进入明确的默认处理，不断开连接。 |

视频展示互动效果，不代表其内部实现规范。要实现类似效果，可以从 [live.gift](/zh/events/live-gift) 和[礼物目录](/zh/reference/gift-catalog)开始。绑定开销较大的游戏动作前，先明确连击触发策略。

想动手体验模拟互动，可以试玩[拔河陷阱](/zh/demos/tug-of-trap)或[糖果擂台](/zh/demos/candy-arena-duel)。接收真实事件则从[快速开始](/zh/guide/quick-start)开始。
