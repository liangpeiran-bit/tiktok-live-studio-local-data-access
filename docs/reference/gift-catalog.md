# Gift Catalog

Use this catalog to find a gift ID, then map that ID to an effect in your app or game. The page supports searching by gift name or ID, sorting by diamond value, and copying the selected ID.

::: warning Point-in-time snapshot
This catalog was extracted from a CN gift-panel response captured on September 4, 2026. It contains 608 unique IDs; 348 were displayed in that panel response. The source response reports `is_full_gift_data=false`, so this is not a permanent global allowlist. Availability, names, prices, and images can change by region, room, account, campaign, and time.
:::

- [Machine-readable JSON](/data/gifts.json)
- [CSV download](/data/gifts.csv)

English search aliases cover the examples **Rose**, **GG**, and **Game Controller**. Other names retain the source language; use the ID if a translated name is not found. [Download search aliases](/data/gift-aliases.json).

Configure effects with the string `gift.id`, not a name or diamond value. For combo-sensitive actions, wait for `repeat_end=true`; use the incoming event for runtime display.

## Browse gifts

<GiftCatalog />

## Match by ID, not by name

Use `payload.gift.id` as the configuration key. In this snapshot, every ID is unique, while 21 name groups contain duplicates. Names may also be localized. Do not use `gift.name`, `diamond_count`, array order, or the image URL as the programmatic identity.

```ts
const effectByGiftId: Record<string, string> = {
  '5655': 'drop-rose',
  '6064': 'show-gg',
  '7569': 'activate-controller-boost'
}

function handleGift(payload: LiveGiftPayload) {
  const effect = effectByGiftId[String(payload.gift.id)]
  if (!effect) return

  // Recommended default: execute once when a combo/repeat sequence is complete.
  if (!payload.repeat_end) return
  runEffect(effect, { count: parsePositiveCount(payload.repeat_count) })
}
```

Keep the mapping in application configuration so a designer can change gift-to-effect rules without editing the WebSocket client. Unknown gift IDs should be ignored or routed to an explicit fallback; they must not close the connection.

## Choose a trigger policy

`repeat_count`, `combo_count`, and `group_count` are strings. A combo may produce several cumulative updates, so multiplying an effect by the full count on every update can execute it more than once.

Choose one policy deliberately:

- **Combo end:** wait for `repeat_end=true`, then execute once using the final checked count. This is the safest default for expensive or state-changing effects.
- **Immediate update:** execute a lightweight visual update for each distinct `message_id`, without treating the cumulative count as a delta.
- **Per gift unit:** keep the last checked count for each non-empty `group_id`, calculate `max(0, current - previous)`, and clear that state when `repeat_end=true`.

## Runtime source of truth

The catalog is for discovery and authoring. When a real `live.gift` event arrives, use its `gift.name`, `diamond_count`, `type`, and `image_url` for display. Retain a generic fallback for an ID that is missing from the snapshot, because new or campaign-specific gifts can appear without a client update.
