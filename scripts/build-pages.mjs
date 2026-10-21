import { copyFile, mkdir } from 'node:fs/promises'

// Real entry files keep direct links and refresh working on static hosting,
// including GitHub Pages, without relying on an HTTP 404 fallback.
for (const page of ['discoveries', 'fact']) {
  await mkdir(`dist/${page}`, { recursive: true })
  await copyFile('dist/index.html', `dist/${page}/index.html`)
}
await copyFile('dist/index.html', 'dist/404.html')
