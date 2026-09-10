# Choose an event

Start with what you want the audience to change. Your authenticated client receives the IM message types enabled for its application; it does not need to send a subscription list.

| Event | Useful for | Handle carefully |
| --- | --- | --- |
| [live.like](/events/live-like) | Team energy, progress, shared goals | `count` and `total` are strings; validate before arithmetic. |
| [live.gift](/events/live-gift) | A chosen gift triggers a specific skill or object | Match `gift.id`, not names. Choose a combo policy. |
| [live.chat](/events/live-chat) | Team selection, commands, audience votes | Render `content` as plain text. |

All three use the same [event envelope](/protocol/events). Deduplicate by event type and `message_id`; the `user` object may be absent.

## Pick a gift, then pick its effect

Use the [Gift Catalog](/reference/gift-catalog#browse-gifts) to copy an ID into your game's configuration. The Gateway delivers the event; your game owns the rules. Unknown gift IDs should not disconnect your client.

## Not receiving an event?

Authentication success does not mean every message type is enabled. Confirm the application configuration and generate a new interaction in a test live room. See [Troubleshooting](/guide/troubleshooting).
