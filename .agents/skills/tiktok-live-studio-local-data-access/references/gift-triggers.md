# Gift selection and effect mapping

Read this file when a task maps `live.gift` events to application or game effects.

The skill ships a curated snapshot at `../assets/gifts.json`. The public source is:

```text
https://tiktok-live-studio-local-data-access.pages.dev/data/gifts.json
```

The catalog is a discovery aid, not a permanent global allowlist. Its metadata records region, capture time, `is_full_gift_data`, captured count, displayed count, and limitations. Gift availability and presentation can vary by region, room, account, campaign, and time.

## Identity rules

- Key application configuration by the string value of `payload.gift.id`.
- Do not key by `gift.name`; names can be duplicated and localized.
- Do not key by `diamond_count`, image URL, or catalog order; these are mutable presentation data.
- Use the live event values for display and keep a fallback for unknown IDs.

Example domain configuration:

```json
{
  "5655": { "effect": "drop-rose", "trigger": "combo-end" },
  "6064": { "effect": "show-gg", "trigger": "immediate" },
  "7569": { "effect": "controller-boost", "trigger": "combo-end" }
}
```

Keep this mapping outside discovery, transport, authentication, and protocol DTOs. Validate configured IDs as strings, but do not reject a running connection when an event contains an unconfigured gift.

## Combo policy

`repeat_count`, `combo_count`, and `group_count` are strings and may represent cumulative progress. Choose a policy explicitly:

1. **Combo end**: if `repeat_end` is false, wait; when true, execute once with the final checked count. Prefer this for state-changing effects.
2. **Immediate update**: execute a lightweight update once per deduplicated `message_id`; never interpret a cumulative count as an event delta.
3. **Per unit**: maintain the last checked count per non-empty `group_id`, calculate `max(0, current - previous)`, and remove state at `repeat_end=true`.

Checked parsing must reject negative, fractional, non-finite, or unsafe values and use an application-defined fallback. Bound and expire per-group state so malformed or abandoned combos cannot leak memory.

## Verification

Test at least:

- two same-name gifts with different IDs select different rules;
- string and numeric-looking IDs are normalized to the documented string key;
- an unknown ID takes the intended ignore or fallback path;
- duplicate `message_id` values do not repeat an effect;
- intermediate cumulative combo updates do not multiply the final effect;
- `repeat_end=true` clears per-group state;
- gameplay or UI effects run on the runtime's required main thread;
- the static catalog is never treated as runtime authorization or availability.
