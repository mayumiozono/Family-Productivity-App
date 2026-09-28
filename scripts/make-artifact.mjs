// Bundles dist/ into one self-contained HTML page (inline CSS and JS),
// so the demo can be shared as a single file or a private link.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const assets = readdirSync('dist/assets')
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n')
const js = assets
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(`dist/assets/${f}`, 'utf8'))
  .join('\n')
  .replace(/<\/script/gi, '<\\/script')

const html = `<title>Rotina em Família</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
mkdirSync('artifact', { recursive: true })
writeFileSync('artifact/rotina-em-familia.html', html)
console.log(`artifact/rotina-em-familia.html (${(html.length / 1024).toFixed(0)} KB)`)
