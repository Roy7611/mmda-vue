import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const cssSrc = join(root, 'src', 'assets', 'css')
const cssDest = join(root, 'dist', 'fontawesome.css')
const faCss = readFileSync(join(cssSrc, 'fontawesome.css'), 'utf8').replace(
  '../fa/css/all.min.css',
  './assets/fa/css/all.min.css',
)
writeFileSync(cssDest, faCss)
cpSync(join(cssSrc, 'theme.css'), join(root, 'dist', 'theme.css'))
cpSync(join(cssSrc, 'material-symbols.css'), join(root, 'dist', 'material-symbols.css'))

console.log('Copied shared CSS and Font Awesome assets to dist')
