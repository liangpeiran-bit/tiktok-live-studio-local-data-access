# 选择事件

先决定观众的行为要改变什么。客户端鉴权后，会收到当前应用开放的 IM 消息类型，不需要再发送订阅列表。

| 事件 | 适合的玩法 | 处理时注意 |
| --- | --- | --- |
| [live.like](/zh/events/live-like) | 阵营能量、进度条、共同目标 | `count` 和 `total` 是字符串，运算前先校验。 |
| [live.gift](/zh/events/live-gift) | 指定礼物触发技能或生成物体 | 按 `gift.id` 匹配，不按名称；明确连击策略。 |
| [live.chat](/zh/events/live-chat) | 评论选队、指令、观众投票 | `content` 按纯文本处理。 |

三种事件使用同一套[事件信封](/zh/protocol/events)。按事件类型与 `message_id` 去重；`user` 对象可能缺失。

## 先选礼物，再配置效果

到[礼物目录](/zh/reference/gift-catalog#检索礼物)复制 ID，写入游戏配置。Gateway 负责投递事件，游戏负责决定效果。未知礼物 ID 不应导致断连。

## 收不到某类事件？

鉴权成功不代表所有消息类型均已开放。确认当前应用配置，并在测试直播间产生一条新的互动。具体检查方法见[排障指南](/zh/guide/troubleshooting)。
