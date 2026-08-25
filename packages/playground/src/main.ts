import { createApp, defineComponent, h, shallowRef } from 'vue'
import {
  MetaUi,
  MetaUiField,
  SqlDataType,
  type EntitySearchParam,
  type PagedList,
} from '@mmda/core'
import {
  MmdaApplication,
  UiBuildContext,
  UiLogic,
  setupI18n,
} from '@mmda/vui'
import {
  PrimeVueOverlayHost,
  PrimeVueUiBuilder,
  mmdaPrimeVue,
} from '@mmda/vui-primevue'
import 'primeicons/primeicons.css'
import './style.css'

const field = (
  fieldName: string,
  displayLabel: string,
  dataType = SqlDataType.NVARCHAR,
  nullable = true,
  fieldIdx = 0,
) =>
  new MetaUiField({
    fieldName,
    displayLabel,
    dataType,
    nullable,
    fieldIdx,
    listed: true,
  })

const metaui = new MetaUi({
  objName: 'Product',
  displayLabel: '商品',
  primaryKey: 'id',
  uniqueKey: 'name',
  groups: [
    {
      groupName: 'base',
      groupLabel: '基本信息',
      many: false,
      fields: [
        field('code', '编码', SqlDataType.NVARCHAR, false),
        field('name', '名称', SqlDataType.NVARCHAR, false, 1),
        field('price', '价格', SqlDataType.DECIMAL, false, 2),
        field('enabled', '启用', SqlDataType.BIT, true, 3),
      ],
    },
  ],
})

type Product = {
  id: string
  rowNum: string
  code: string
  name: string
  price: number
  enabled: boolean
  editable: boolean
  deletable: boolean
  entityState: number
}

const rows: Product[] = [
  {
    id: '1',
    rowNum: '1',
    code: 'P-001',
    name: '演示商品',
    price: 99,
    enabled: true,
    editable: true,
    deletable: true,
    entityState: 0,
  },
  {
    id: '2',
    rowNum: '2',
    code: 'P-002',
    name: '第二件商品',
    price: 128,
    enabled: true,
    editable: true,
    deletable: true,
    entityState: 0,
  },
]

const current = shallowRef<UiBuildContext<any>>()
let openView: (view: string, id?: string) => Promise<void>

const router = {
  push(target: any) {
    if (typeof target === 'string') return openView('index')
    return openView(target.params?.view ?? 'index', target.params?.id)
  },
  back() {
    return openView('index')
  },
}

class ProductLogic extends UiLogic<Product> {
  async getAll(param?: EntitySearchParam): Promise<PagedList<Product>> {
    const word = param?.searchWord?.toLowerCase() ?? ''
    const list = rows.filter(
      item =>
        !word ||
        item.code.toLowerCase().includes(word) ||
        item.name.toLowerCase().includes(word),
    )
    return {
      list: list.map(item => ({ ...item })),
      pagination: {
        pageNo: 1,
        pageSize: 10,
        pageCount: 1,
        recordCount: list.length,
      },
    }
  }

  async load(id: string) {
    const item = rows.find(row => row.id === id)
    if (!item) throw new Error(`Product ${id} not found`)
    return { ...item }
  }

  async create() {
    return {
      id: '',
      rowNum: '',
      code: '',
      name: '',
      price: 0,
      enabled: true,
      editable: true,
      deletable: true,
      entityState: 1,
    }
  }

  async save(model: Product) {
    const saved = { ...model }
    if (!saved.id) {
      saved.id = String(rows.length + 1)
      saved.rowNum = saved.id
      rows.push(saved)
    } else {
      const index = rows.findIndex(row => row.id === saved.id)
      if (index >= 0) rows[index] = saved
    }
    return { ...saved }
  }

  async delete(id: string) {
    const index = rows.findIndex(row => row.id === id)
    if (index >= 0) rows.splice(index, 1)
    await openView('index')
    return true
  }

  async initMetadata() {
    return this.meta
  }
}

const fakeService = {
  getApiClient: () => ({}),
  getPack: async () => ({ metaui }),
} as any

const logic = new ProductLogic(value => value as Product, {
  repository: 'Products',
  service: fakeService,
  meta: { metaui },
  router,
})

const builder = new PrimeVueUiBuilder()
const i18n = setupI18n({}, 'zh')
const mmda = new MmdaApplication('/api', 'demo', builder, i18n)

openView = async (view, id) => {
  const model =
    view === 'index'
      ? ({ list: [], pagination: {} } as any)
      : view === 'create'
        ? await logic.create()
        : await logic.load(id ?? rows[0]?.id)
  const context = new UiBuildContext({
    model,
    metaui,
    view: view as any,
    logic,
    app: mmda,
  })
  current.value = context
  if (view === 'index') await context.search()
}

const Root = defineComponent({
  setup() {
    void openView('index')
    return () =>
      h('div', { class: 'playground' }, [
        h('header', { class: 'playground-title' }, [
          h('div', [
            h('small', 'MMDA / VUI'),
            h('h1', '可运行移植验证'),
          ]),
          h(
            'button',
            { type: 'button', onClick: () => openView('index') },
            '返回列表',
          ),
        ]),
        current.value
          ? current.value.many
            ? builder.buildListView(current.value, {
                showToolbar: true,
                showSearchbar: true,
                selectionMode: 'multiple',
                onItemDoubleClick: (item: any) =>
                  openView('edit', (item as Product).id),
              })
            : builder.buildView(current.value, { showToolbar: true })
          : h('p', 'Loading…'),
        h(PrimeVueOverlayHost),
      ])
  },
})

createApp(Root).use(mmdaPrimeVue, { locale: 'zh' }).use(mmda).mount('#app')
