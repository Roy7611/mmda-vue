import { isBrowser } from './is'

export const supportLocalStorage =
  isBrowser && window.localStorage !== undefined
export const supportIndexedDb = isBrowser && window.indexedDB !== undefined

/** 公共 SSO 库名：localStorage 为 `mmda/user`、`mmda/config` */
export const MMDA_LOCAL_DB_NAME = 'mmda'

/**
 * 本地数据库
 */
export interface LocalDb {
  get: (key: string) => any
  put: (key: string, value: any) => void
  delete: (key: string) => void
  clear: () => void
}

/**
 * 基于localStorage的本地数据库
 * @see {@link https://juejin.cn/post/7048976403349536776|使用Typescript封装本地存储}
 */
export class LocalStorageDb implements LocalDb {
  private readonly dbName: string
  private readonly storage: Storage
  constructor(
    dbName: string,
    locale: string = 'zh',
    sessionOnly: boolean = false
  ) {
    this.dbName = locale ? `${dbName}/${locale}` : dbName
    this.storage = sessionOnly ? window.sessionStorage : window.localStorage
  }

  private getStorageKey(key: string) {
    return this.dbName + '/' + key
  }

  get(key: string) {
    const value = this.storage.getItem(this.getStorageKey(key))
    if (!value) return null
    return JSON.parse(value)
  }

  put(key: string, value: any) {
    const data = JSON.stringify(value)
    this.storage.setItem(this.getStorageKey(key), data)
  }

  delete(key: string) {
    this.storage.removeItem(this.getStorageKey(key))
  }

  clear() {
    const prefix = this.getStorageKey('')
    const toRemove: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i)
      if (k && k.startsWith(prefix)) toRemove.push(k)
    }
    toRemove.forEach((k) => this.storage.removeItem(k))
  }
}

/**
 * 本地异步数据库
 */
export interface LocalAsyncDb {
  get: (key: string) => Promise<any>
  getMany(keys: string[]): Promise<any[]>
  put: (key: string, value: any) => Promise<void>
  putMany(entries: [string, any][]): Promise<void>
  delete: (key: string) => Promise<void>
  deleteMany(keys: string[]): Promise<void>
  clear: () => Promise<void>
}

/**
 * 本地异步存储数据库，使用Promise封装了{@link LocalStorageDb}
 */
export class LocalAsyncStorageDb implements LocalAsyncDb {
  readonly db: LocalStorageDb
  constructor(dbName: string, locale: string = 'zh') {
    this.db = new LocalStorageDb(dbName, locale)
  }

  get(key: string) {
    return Promise.resolve(this.db.get(key))
  }

  getMany(keys: string[]): Promise<any[]> {
    return Promise.resolve(keys.map(key => this.db.get(key)))
  }

  put(key: string, value: any) {
    return Promise.resolve(this.db.put(key, value))
  }
  putMany(entries: [string, any][]): Promise<void> {
    return Promise.resolve(
      entries.forEach(entry => this.db.put(entry[0], entry[1]))
    )
  }
  delete(key: string) {
    return Promise.resolve(this.db.delete(key))
  }
  deleteMany(keys: string[]): Promise<void> {
    return Promise.resolve(keys.forEach(key => this.db.delete(key)))
  }
  clear() {
    return Promise.resolve(this.db.clear())
  }
}

enum TxMode {
  READ_ONLY = 'readonly',
  READ_WRITE = 'readwrite',
  VERSION_CHANGE = 'versionchange',
}
type UseIDbStore = <T>(
  txMode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => T | PromiseLike<T>
) => Promise<T>

function promisifyRequest<T = undefined>(
  request: IDBRequest<T> | IDBTransaction
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // @ts-ignore - file size hacks
    request.oncomplete = request.onsuccess = () => resolve(request.result)
    // @ts-ignore - file size hacks
    request.onabort = request.onerror = () => reject(request.error)
  })
}

/**
 * 基于IndexedDb的本地异步数据库
 */
export class LocalIndexedDb implements LocalAsyncDb {
  private readonly dbStore: UseIDbStore
  constructor(
    public readonly dbName: string,
    readonly locale: string = 'zh',
    public readonly options?: IDBObjectStoreParameters,
    public readonly version?: number
  ) {
    this.dbStore = this.createStore(locale)
  }

  protected createStore(storeName: string): UseIDbStore {
    let dbPromise: Promise<IDBDatabase> | undefined

    const openWithStore = (): Promise<IDBDatabase> =>
      new Promise((resolve, reject) => {
        const tryOpen = (version?: number) => {
          const request = window.indexedDB.open(this.dbName, version)
          request.onerror = () =>
            reject(request.error ?? new Error(`IndexedDB open failed: ${this.dbName}`))
          request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, this.options)
            }
          }
          request.onsuccess = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(storeName)) {
              const nextVersion = db.version + 1
              db.close()
              tryOpen(nextVersion)
              return
            }
            db.onversionchange = () => {
              db.close()
              dbPromise = undefined
            }
            resolve(db)
          }
        }
        tryOpen(this.version)
      })

    const getDb = () => {
      if (!dbPromise) dbPromise = openWithStore()
      return dbPromise
    }

    return async (txMode, callback) => {
      const run = async (retried = false): Promise<any> => {
        const db = await getDb()
        try {
          if (!db.objectStoreNames.contains(storeName)) {
            throw new DOMException(
              `Object store "${storeName}" not found in "${this.dbName}"`,
              'NotFoundError',
            )
          }
          return await callback(
            db.transaction(storeName, txMode).objectStore(storeName),
          )
        } catch (error: any) {
          const missingStore =
            error?.name === 'NotFoundError' ||
            error?.name === 'InvalidStateError'
          if (!retried && missingStore) {
            try {
              db.close()
            } catch {
              /* ignore */
            }
            dbPromise = undefined
            return run(true)
          }
          throw error
        }
      }
      return run()
    }
  }

  get(key: string): Promise<any> {
    return this.dbStore(TxMode.READ_ONLY, store =>
      promisifyRequest(store.get(key))
    )
  }
  getMany(keys: string[]): Promise<any[]> {
    return this.dbStore(TxMode.READ_ONLY, store =>
      Promise.all(keys.map(key => promisifyRequest(store.get(key))))
    )
  }
  put(key: string, value: any): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, store => {
      store.put(value, key)
      return promisifyRequest(store.transaction)
    })
  }
  putMany(entries: [string, any][]): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, store => {
      entries.forEach(entry => store.put(entry[1], entry[0]))
      return promisifyRequest(store.transaction)
    })
  }
  delete(key: string): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, store => {
      store.delete(key)
      return promisifyRequest(store.transaction)
    })
  }
  deleteMany(keys: string[]): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, (store: IDBObjectStore) => {
      keys.forEach(key => store.delete(key))
      return promisifyRequest(store.transaction)
    })
  }
  clear(): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, store => {
      store.clear()
      return promisifyRequest(store.transaction)
    })
  }

  /**
   * 删除 key 包含给定片段的记录。
   */
  deleteKeysContaining(fragment: string): Promise<void> {
    return this.dbStore(TxMode.READ_WRITE, (store) => {
      store.openCursor().onsuccess = (e: Event) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>)
          .result
        if (cursor) {
          if (String(cursor.key).includes(fragment)) {
            store.delete(cursor.key)
          }
          cursor.continue()
        }
      }
      return promisifyRequest(store.transaction)
    })
  }

  /** @deprecated 名字像读取，实际是按片段删除。改用 {@link deleteKeysContaining} */
  getAllKeys(key: string): Promise<void> {
    return this.deleteKeysContaining(key)
  }
}

/**
 * 公共 SSO 库（仅 `user` / `config`）。
 * 优先 localStorage（`mmda/user`、`mmda/config`），避开 IndexedDB objectStore 升级竞态。
 */
export function useMmdaSsoDb(
  options?: IDBObjectStoreParameters,
): LocalAsyncDb {
  if (supportLocalStorage) {
    return new LocalAsyncStorageDb(MMDA_LOCAL_DB_NAME, '')
  }
  if (supportIndexedDb) {
    return new LocalIndexedDb(MMDA_LOCAL_DB_NAME, 'sso', options)
  }
  throw new Error('Local db not supported!')
}

/**
 * 使用indexedDB或localstorage创建本地异步数据库的实例
 * 基于当前环境中的可用性。
 *
 * @param dbName  -要使用的数据库的名称。
 * @param locale  -数据库的语言环境设置，默认为“ ZH”。
 * @param options  -配置数据库的可选参数。
 * @returns ``localasyncdb''的实例，它可能由索引eddb或localstorage支持。
 * @throws 如果不支持索引和localstorage，将会丢弃错误。
 */
export function useLocalAsyncDb(
  dbName: string,
  locale: string = 'zh',
  options?: IDBObjectStoreParameters,
): LocalAsyncDb {
  if (supportIndexedDb) return new LocalIndexedDb(dbName, locale, options)
  else if (supportLocalStorage) return new LocalAsyncStorageDb(dbName, locale)
  else throw new Error('Local db not supported!')
}
