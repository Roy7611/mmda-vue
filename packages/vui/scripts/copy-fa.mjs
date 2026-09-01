import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src', 'assets', 'fa')
const dest = join(root, 'dist', 'assets', 'fa')

if (!existsSync(src)) {
  console.error('Font Awesome assets missing:', src)
  process.exit(1)
}

mkdirSync(dirname(dest), { recursive: true })
cpSync(src, dest, { recursive: true })

// 供 package exports ./fontawesome.css 指向 dist
const cssDest = join(root, 'dist', 'fontawesome.css')
cpSync(join(root, 'src', 'fontawesome.css'), cssDest)
cpSync(join(root, 'src', 'theme.css'), join(root, 'dist', 'theme.css'))
cpSync(join(root, 'src', 'material-symbols.css'), join(root, 'dist', 'material-symbols.css'))

console.log('Copied shared CSS and Font Awesome assets to dist')
