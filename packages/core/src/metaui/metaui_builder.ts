import { SqlDataType } from './datatype'
import {
  MetaUiField,
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  type MetaAggregation,
  type MetaUiFieldInit,
} from './metaui_field'
import { MetaUi, MetaUiGroup } from './metaui_group'

export type MetaUiFieldPartial = Partial<MetaUiFieldInit> & {
  fieldName?: string
}

function asField(
  value: MetaUiField | MetaUiFieldInit | MetaUiFieldPartial,
  fieldIdx: number,
): MetaUiField {
  if (value instanceof MetaUiField) {
    if (value.listed == null) value.listed = true
    return value
  }
  const init = value as MetaUiFieldPartial
  return new MetaUiField({
    fieldIdx: init.fieldIdx ?? fieldIdx,
    fieldName: init.fieldName ?? `field${fieldIdx}`,
    displayLabel: init.displayLabel ?? init.fieldName ?? `field${fieldIdx}`,
    dataType: init.dataType ?? SqlDataType.NVARCHAR,
    nullable: init.nullable ?? true,
    listed: init.listed ?? true,
    ...init,
  })
}

/**
 * 流式拼一份列表用 MetaUi，再交给 `factory.table(rows, metaui)`。
 */
export class MetaUiBuilder {
  private readonly _fields: MetaUiField[] = []
  private last?: MetaUiField
  private idx = 0

  private constructor(private readonly objName: string) {}

  static create(objName: string) {
    return new MetaUiBuilder(objName)
  }

  /** `MetaUi.list` 的短写：名 + 字段数组。 */
  static list(
    objName: string,
    fields: Array<MetaUiField | MetaUiFieldInit | MetaUiFieldPartial> = [],
  ) {
    return MetaUiBuilder.create(objName).fields(fields).build()
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
  field(init: MetaUiField | MetaUiFieldInit | MetaUiFieldPartial): this
  field(name: string, partial: MetaUiFieldPartial): this
  field(
    nameOrInit: string | MetaUiField | MetaUiFieldInit | MetaUiFieldPartial,
    labelOrPartial?: string | MetaUiFieldPartial,
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
          this.idx++,
        )
      } else {
        field = asField(
          { ...labelOrPartial, fieldName: nameOrInit },
          this.idx++,
        )
      }
    } else {
      field = asField(nameOrInit, this.idx++)
    }
    this._fields.push(field)
    this.last = field
    return this
  }

  fields(
    items: Array<MetaUiField | MetaUiFieldInit | MetaUiFieldPartial>,
  ): this {
    for (const item of items) this.field(item)
    return this
  }

  listed(value = true) {
    if (this.last) this.last.listed = value
    return this
  }

  listSize(px: number) {
    if (this.last) this.last.listSize = px
    return this
  }

  align(value: MetaUiFieldAlignment) {
    if (this.last) (this.last as { align?: MetaUiFieldAlignment }).align = value
    return this
  }

  frozen(value: MetaUiFieldFrozen) {
    if (this.last) this.last.frozen = value
    return this
  }

  aggregation(value: MetaAggregation) {
    if (this.last)
      (this.last as { aggregationSet?: MetaAggregation }).aggregationSet = value
    return this
  }

  build(): MetaUi {
    return new MetaUi({
      objName: this.objName,
      displayLabel: this.objName,
      groups: [
        new MetaUiGroup({
          groupName: 'a1',
          groupLabel: this.objName,
          many: false,
          fields: this._fields,
        }),
      ],
      assembled: true,
    })
  }
}
