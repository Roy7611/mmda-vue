import type { Module } from '@mmda/core'
import type { MmdaApplication } from '@mmda/vui'
import { APP_NAME } from './keys'

/** 按路由仓库名解析模块（含 parent 链，供面包屑使用） */
export function resolveRepositoryModule(
  app: MmdaApplication,
  repository: string,
): Module | undefined {
  const singular = repository.replace(/s$/, '')
  return (
    app.findModule(`/${APP_NAME}/${repository}`) ??
    app.findModule(`/${APP_NAME}/${singular}`) ??
    app.findModule(singular) ??
    app.findModule(repository)
  )
}
