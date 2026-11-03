import { existsSync, writeFileSync } from 'node:fs'

const SITE_ORIGIN = 'https://kelldev.design'
const API_URL = process.env.VITE_PORTFOIO_API_URL || 'https://api.kelldev.design/'
const DIST_DIR = 'dist'

const fail = message => {
  console.error(`generate-sitemap: ${message}`)
  process.exit(1)
}

const escapeXml = value => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

if (!existsSync(DIST_DIR)) fail(`${DIST_DIR}/ does not exist; run the vite build first`)

let body
try {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ portfolioItems { projectId } }' })
  })

  if (!response.ok) fail(`API responded with ${response.status} ${response.statusText}`)
  body = await response.json()
} catch (error) {
  fail(`failed to fetch portfolio items from ${API_URL}: ${error.message}`)
}

if (body.errors?.length) fail(`GraphQL errors: ${JSON.stringify(body.errors)}`)
if (!Array.isArray(body.data?.portfolioItems)) fail('response has no data.portfolioItems array')

const entries = [
  { path: '/', priority: '1.0' },
  { path: '/design', priority: '0.8' },
  { path: '/development', priority: '0.8' },
  { path: '/contact', priority: '0.8' },
  ...body.data.portfolioItems.map(({ projectId }) => ({
    path: `/project/${projectId}`,
    priority: '0.6'
  }))
]

const urls = entries.map(({ path, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>`,
  '    <changefreq>monthly</changefreq>',
  `    <priority>${priority}</priority>`,
  '  </url>'
].join('\n'))

writeFileSync(
  `${DIST_DIR}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
)
console.log(`generate-sitemap: wrote ${entries.length} URLs to ${DIST_DIR}/sitemap.xml`)
