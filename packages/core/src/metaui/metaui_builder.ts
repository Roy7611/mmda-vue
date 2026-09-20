import { SqlDataType } from './datatype'
import {
  MetaUiField,
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  type MetaAggregation,
  type MetaUiFieldInit,
} from './metaui_field'
import { MetaUi, MetaUiGroup } from './metaui_group'

type MetaUiFieldInput = MetaUiField | Partial<MetaUiFieldInit>

function asField(value: MetaUiFieldInput, fieldIdx: number): MetaUiField {
  if (value instanceof MetaUiField) {
    if (value.listed == null) value.listed = true
    return value
  }
  return new MetaUiField({
    fieldIdx: value.fieldIdx ?? fieldIdx,
    fieldName: value.fieldName ?? `field${fieldIdx}`,
    displayLabel: value.displayLabel ?? value.fieldName ?? `field${fieldIdx}`,
    dataType: value.dataType ?? SqlDataType.NVARCHAR,
    nullable: value.nullable ?? true,
    listed: value.listed ?? true,
    ...value,
  })
}

/**
 * 流式拼一份列表用 MetaUi，再交给 `builder.table(metaUi, { rows })`。
 * @example
 * 流式：
 * ```ts
 * const metaUi = MetaUiBuilder.create('Person')
 *   .rowNumber()
 *   .field('name', 'Name').listSize(100)
 *   .field('age', 'Age').listSize(100).align(MetaUiFieldAlignment.RIGHT)
 *   .build()
 * ```
 * 短写：
 * ```ts
 * const metaUi = MetaUiBuilder.create('Person', [
 *   { fieldName: 'name', displayLabel: 'Name', listSize: 100 },
 *   { fieldName: 'age', displayLabel: 'Age', listSize: 100, align: MetaUiFieldAlignment.RIGHT },
 * ]).build()
 * ```
 * @remarks
 * 构造器：MetaUiBuilder.create(objName, fields?)
 * 方法：
 * - field(name: string, label?: string): this
 * - field(init: MetaUiFieldInput): this
 * - field(name: string, partial: Partial<MetaUiFieldInit>): this
 * - fields(items: MetaUiFieldInput[]): this
 * - listed(value = true): this
 * - listSize(px: number): this
 * - align(value: MetaUiFieldAlignment): this
 * - frozen(value: MetaUiFieldFrozen): this
 * - aggregation(value: MetaAggregation): this
 * - build(): MetaUi
 */
export class MetaUiBuilder {
  #fields: MetaUiField[] = []
  #last?: MetaUiField
  #idx = 0
  #objName: string

  private constructor(objName: string) {
    this.#objName = objName
  }

  static create(objName: string, fields?: MetaUiFieldInput[]) {
    const builder = new MetaUiBuilder(objName)
    if (fields) builder.fields(fields)
    return builder
  }

  rowNumber(label = '#') {
    return this.field({
      fieldName: '_rowNumber',
      displayLabel: label,
      listed: true,
      listSize: 48,
      readOnly: true,
    })
  }

  field(name: string, label?: string): this
  field(init: MetaUiFieldInput): this
  field(name: string, partial: Partial<MetaUiFieldInit>): this
  field(
    nameOrInit: string | MetaUiFieldInput,
    labelOrPartial?: string | Partial<MetaUiFieldInit>,
  ): this {
    let field: MetaUiField
    if (typeof nameOrInit === 'string') {
      if (typeof labelOrPartial === 'string' || labelOrPartial == null) {
        field = asField(
          {
            fieldName: nameOrInit,
            displayLabel:
              typeof labelOrPartial === 'string' ? labelOrPartial : nameOrInit,
          },
          this.#idx++,
        )
      } else {
        field = asField(
          { ...labelOrPartial, fieldName: nameOrInit },
          this.#idx++,
        )
      }
    } else {
      field = asField(nameOrInit, this.#idx++)
    }
    this.#fields.push(field)
    this.#last = field
    return this
  }

  fields(items: MetaUiFieldInput[]): this {
    for (const item of items) this.field(item)
    return this
  }

  listed(value = true) {
    if (this.#last) this.#last.listed = value
    return this
  }

  listSize(px: number) {
    if (this.#last) this.#last.listSize = px
    return this
  }

  align(value: MetaUiFieldAlignment) {
    if (this.#last) this.#last.align = value
    return this
  }

  frozen(value: MetaUiFieldFrozen) {
    if (this.#last) this.#last.frozen = value
    return this
  }

  aggregation(value: MetaAggregation) {
    if (this.#last) this.#last.aggregationSet = value
    return this
  }

  build(): MetaUi {
    return new MetaUi({
      objName: this.#objName,
      displayLabel: this.#objName,
      groups: [
        new MetaUiGroup({
          groupName: 'a1',
          groupLabel: this.#objName,
          many: false,
          fields: this.#fields,
        }),
      ],
      assembled: true,
    })
  }
}
