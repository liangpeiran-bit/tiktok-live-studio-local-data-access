import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siteBaseUrl = 'https://tiktok-live-studio-local-data-access.pages.dev'
const repositoryRawBaseUrl =
  'https://raw.githubusercontent.com/liangpeiran-bit/tiktok-live-studio-local-data-access/main'

const agentSkillDocuments = [
  '.agents/skills/tiktok-live-studio-local-data-access/SKILL.md',
  '.agents/skills/tiktok-live-studio-local-data-access/references/protocol.md',
  '.agents/skills/tiktok-live-studio-local-data-access/references/events.md',
  '.agents/skills/tiktok-live-studio-local-data-access/references/stack-adaptation.md',
  '.agents/skills/tiktok-live-studio-local-data-access/references/verification.md',
]

const englishDocuments = [
  'docs/guide/overview.md',
  'docs/guide/quick-start.md',
  'docs/guide/architecture.md',
  'docs/protocol/connection.md',
  'docs/protocol/auth.md',
  'docs/protocol/events.md',
  'docs/protocol/errors.md',
  'docs/events/live-like.md',
  'docs/events/live-gift.md',
  'docs/events/live-chat.md',
  'docs/guide/agent-skill.md',
  'docs/guide/troubleshooting.md',
  'docs/samples/javascript.md',
  'docs/samples/unity.md',
  'docs/samples/h5.md',
  ...agentSkillDocuments,
]

const chineseDocuments = [
  'docs/zh/guide/overview.md',
  'docs/zh/guide/quick-start.md',
  'docs/zh/guide/architecture.md',
  'docs/zh/protocol/connection.md',
  'docs/zh/protocol/auth.md',
  'docs/zh/protocol/events.md',
  'docs/zh/protocol/errors.md',
  'docs/zh/events/live-like.md',
  'docs/zh/events/live-gift.md',
  'docs/zh/events/live-chat.md',
  'docs/zh/guide/agent-skill.md',
  'docs/zh/guide/troubleshooting.md',
  'docs/zh/samples/javascript.md',
  'docs/zh/samples/unity.md',
  'docs/zh/samples/h5.md',
  ...agentSkillDocuments,
]

function getCanonicalUrl(sourcePath) {
  if (sourcePath.startsWith('docs/')) {
    const route = sourcePath.slice('docs/'.length).replace(/\.md$/, '')
    return `${siteBaseUrl}/${route}`
  }

  return `${repositoryRawBaseUrl}/${sourcePath}`
}

function rewriteRootLinks(markdown) {
  return markdown.replace(/(\[[^\]]*\]\()\/(?!\/)([^)]+)(\))/g, `$1${siteBaseUrl}/$2$3`)
}

async function renderDocument(sourcePath) {
  const absolutePath = resolve(repositoryRoot, sourcePath)
  const markdown = (await readFile(absolutePath, 'utf8')).replace(/\r\n/g, '\n').trim()
  const canonicalUrl = getCanonicalUrl(sourcePath)

  return [
    '<document>',
    `<source>${canonicalUrl}</source>`,
    `<repository-path>${sourcePath}</repository-path>`,
    '',
    rewriteRootLinks(markdown),
    '</document>',
  ].join('\n')
}

async function generateFullContext({ outputPath, title, summary, documents }) {
  const renderedDocuments = await Promise.all(documents.map(renderDocument))
  const output = [
    `# ${title}`,
    '',
    `> ${summary}`,
    '',
    'Protocol version: `1.0.0`. This file is generated from the documentation and Agent Skill sources in the GitHub repository. Do not edit it manually.',
    '',
    renderedDocuments.join('\n\n---\n\n'),
    '',
  ].join('\n')

  const absoluteOutputPath = resolve(repositoryRoot, outputPath)
  await mkdir(dirname(absoluteOutputPath), { recursive: true })
  await writeFile(absoluteOutputPath, output, 'utf8')
  return Buffer.byteLength(output, 'utf8')
}

const outputs = [
  {
    outputPath: 'docs/public/llms-full.txt',
    title: 'TikTok LIVE Studio Local Data Access — Complete Context',
    summary:
      'Complete English implementation context for the local WebSocket protocol, public events, samples, troubleshooting, and the cross-stack Agent Skill.',
    documents: englishDocuments,
  },
  {
    outputPath: 'docs/public/zh/llms-full.txt',
    title: 'TikTok LIVE Studio 本地数据开放——完整上下文',
    summary:
      '本地 WebSocket 协议、公共事件、示例、排障和跨技术栈 Agent Skill 的完整中文接入上下文。Agent Skill 源文件保留英文原文。',
    documents: chineseDocuments,
  },
]

for (const output of outputs) {
  const byteLength = await generateFullContext(output)
  console.log(`Generated ${output.outputPath} (${byteLength} bytes)`)
}
