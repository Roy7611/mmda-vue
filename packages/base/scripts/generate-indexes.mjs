import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

function toRepository(className) {
  const name = className.replace(/Logic$/, '')
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`
  if (/(?:s|x|z|ch|sh)$/i.test(name)) return `${name}es`
  return `${name}s`
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(path))
    else out.push(path)
  }
  return out
}

const modelFiles = readdirSync(join(src, 'models')).filter(
  (name) => name.endsWith('.ts') && name !== 'index.ts',
)
writeFileSync(
  join(src, 'models', 'index.ts'),
  modelFiles.map((name) => `export * from './${name.replace(/\.ts$/, '')}'\n`).join(''),
)

const enumFiles = readdirSync(join(src, 'enums')).filter(
  (name) => name.endsWith('.ts') && name !== 'index.ts',
)
writeFileSync(
  join(src, 'enums', 'index.ts'),
  enumFiles.map((name) => `export * from './${name.replace(/\.ts$/, '')}'\n`).join(''),
)

const logicFiles = walk(join(src, 'modules')).filter((path) =>
  path.endsWith('Logic.ts'),
)

const logicEntries = []
for (const file of logicFiles) {
  let text = readFileSync(file, 'utf8')
  text = text
    .replaceAll("from '@/models/", "from '../../models/")
    .replaceAll('from "@/models/', 'from "../../models/')
    .replaceAll("from '@/enums/", "from '../../enums/")
    .replaceAll('from "@/enums/', 'from "../../enums/')
    .replace("from '@/components/changeUsePwd/changeUsePwd'", "from '../../components/ChangePasswordForm'")
    .replace("from '@/components/NoticeFn'", "from '../../components/NoticeFn'")
    .replace("import { type Worker, defineWorker } from '@mmda/mes/src/models/Worker';\n", '')
    .replace("import { type Worker, defineWorker } from '@mmda/mes/src/models/Worker'\n", '')
  writeFileSync(file, text)

  const classMatch = text.match(/export class (\w+Logic)/)
  if (!classMatch) continue
  const ctorRepo = text.match(
    new RegExp(`${classMatch[1]}Ctor[\\s\\S]*?repository:\\s*'([^']+)'`),
  )
  const repository =
    ctorRepo?.[1] ?? toRepository(classMatch[1])
  const importPath = `../modules/${relative(join(src, 'modules'), file).replaceAll('\\', '/').replace(/\.ts$/, '')}`
  logicEntries.push({
    className: classMatch[1],
    repository,
    importPath,
  })
}

const logicsTs = `import type { UiLogic, UiLogicInit } from '@mmda/vui'

type LogicCtor = new (init: UiLogicInit) => UiLogic<any>
type LogicLoader = () => Promise<LogicCtor>
const logic = <M>(load: () => Promise<M>, name: keyof M): LogicLoader =>
  async () => (await load())[name] as LogicCtor

export const LOGIC_LOADERS: Record<string, LogicLoader> = {
${logicEntries.map((entry) => `  ${entry.repository}: logic(() => import('${entry.importPath}'), '${entry.className}'),`).join('\n')}
}

export async function createRepositoryLogic(repository: string, init: UiLogicInit) {
  const loader = LOGIC_LOADERS[repository]
  return loader ? new (await loader())(init) : undefined
}
`

mkdirSync(join(src, 'logic'), { recursive: true })
writeFileSync(join(src, 'logic', 'registry.ts'), `${logicsTs}`)
console.log(`indexed ${modelFiles.length} models, ${enumFiles.length} enums, ${logicEntries.length} logics`)
