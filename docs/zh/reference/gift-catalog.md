# 礼物目录

你可以先在这里找到礼物 ID，再把这个 ID 配置成应用或游戏里的具体效果。页面支持按名称或 ID 搜索、按钻石价值排序，并可直接复制 ID。

::: warning 这是一个时间点快照
本目录来自 2026 年 9 月 4 日抓取的一次 CN 礼物面板响应，共提取 608 个唯一 ID，其中 348 个在该响应中标记为面板可见。原始响应明确标记 `is_full_gift_data=false`，因此它不是永久有效的全球礼物白名单。礼物是否可用、名称、价格和图片都可能随地区、直播间、账号、活动与时间变化。
:::

- [机器可读 JSON](/data/gifts.json)
- [下载 CSV](/data/gifts.csv)

<GiftCatalog />

## 按 ID 匹配，不要按名称匹配

使用 `payload.gift.id` 作为配置键。本次快照中所有 ID 都唯一，但有 21 组礼物重名；名称还可能随语言变化。不要用 `gift.name`、`diamond_count`、数组顺序或图片 URL 作为程序里的礼物身份。

```ts
const effectByGiftId: Record<string, string> = {
  '5655': 'drop-rose',
  '6064': 'show-gg',
  '7569': 'activate-controller-boost'
}

function handleGift(payload: LiveGiftPayload) {
  const effect = effectByGiftId[String(payload.gift.id)]
  if (!effect) return

  // 推荐默认策略：等连击结束后只执行一次。
  if (!payload.repeat_end) return
  runEffect(effect, { count: parsePositiveCount(payload.repeat_count) })
}
```

建议把映射保存在业务配置中，让策划可以在不修改 WebSocket 客户端的情况下调整“礼物 → 效果”规则。遇到未知礼物 ID 时应忽略或进入明确的默认效果，不能因此断开连接。

## 明确选择触发策略

`repeat_count`、`combo_count` 和 `group_count` 都是字符串。一次连击可能产生多条累计更新，如果每次都用完整累计值放大效果，就会重复执行。

请明确选择一种策略：

- **连击结束触发：** 等待 `repeat_end=true`，校验最终数量后只执行一次。对于昂贵或会改变游戏状态的效果，这是最安全的默认方案。
- **即时更新：** 每个不同的 `message_id` 触发一次轻量视觉反馈，但不要把累计数量当作本次增量。
- **逐个礼物触发：** 按非空 `group_id` 保存上次计数，计算 `max(0, current - previous)`，并在 `repeat_end=true` 时清理状态。

## 运行时数据才是最终事实

目录用于检索和配置。真实 `live.gift` 到达时，展示层应使用事件里的 `gift.name`、`diamond_count`、`type` 和 `image_url`。客户端还需要保留未知 ID 的通用兜底，因为新礼物或活动礼物可能在不更新客户端的情况下出现。
