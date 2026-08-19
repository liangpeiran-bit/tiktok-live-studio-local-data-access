# LIVE Studio Local Data Access

Developer documentation for LIVE Studio Local Data Access: a local WebSocket API that delivers live room events such as likes, gifts, and chat to trusted third-party apps on the creator machine.

- English: `/`
- 简体中文: `/zh/`

## Local preview

Requires Node.js 22+.

```bash
npm install
npm run docs:dev
```

## Build

```bash
npm run docs:build
```

Output directory: `docs/.vitepress/dist`

## Agent Skill

This repository includes a technology-stack-independent Agent Skill at:

```txt
.agents/skills/tiktok-live-studio-local-data-access/
```

It teaches coding agents the complete discovery, authentication, event, reconnect, security, and verification workflow. The package is self-contained: copy the whole skill directory, including `references/`, into another project rather than copying only `SKILL.md`.

Install globally for the coding agents detected on the developer machine:

```bash
npx skills add liangpeiran-bit/tiktok-live-studio-local-data-access \
  --skill tiktok-live-studio-local-data-access \
  -g
```

Update an installed copy:

```bash
npx skills update tiktok-live-studio-local-data-access -g -y
```

- [Agent Skill guide](https://tiktok-live-studio-local-data-access.pages.dev/guide/agent-skill)
- [Agent Skill 使用指南](https://tiktok-live-studio-local-data-access.pages.dev/zh/guide/agent-skill)

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Node version | `22` (`NODE_VERSION=22`) |
