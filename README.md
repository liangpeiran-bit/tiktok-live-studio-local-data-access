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

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Node version | `22` (`NODE_VERSION=22`) |
