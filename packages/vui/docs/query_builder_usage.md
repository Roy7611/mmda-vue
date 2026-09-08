# Query Builder：怎么写

从当前皮肤的 `builder.factory.queryBuilder` 取节点。设计见 [query_builder.md](./query_builder.md)。EJ2：[Query Builder Vue 3](https://ej2.syncfusion.com/vue/documentation/query-builder/vue-3-getting-started)。

```ts
factory.queryBuilder({
  fields: metaUi.getListedFields(),
  value: query.advancedFilterModel,
  onChange: (model) => {
    query.advancedFilterModel = model
  },
})
```

值是 `EntityAdvancedFilterModel`，例如：

```ts
{
  filterType: 'join',
  operator: 'AND',
  conditions: [
    {
      filterType: 'join',
      operator: 'OR',
      conditions: [
        { fieldName: 'age', filterType: 'number', operator: 'GT', value: 23 },
        { fieldName: 'sport', filterType: 'text', operator: 'ENDS_WITH', value: 'ing' },
      ],
    },
    { fieldName: 'country', filterType: 'text', operator: 'CONTAINS', value: 'united' },
  ],
}
```

不要把这棵树写进 `filterModel`，也不要塞进 `searchAll` 的 POST（服务端尚未接高级过滤）。保存查询可放在 `EntityQuery.advancedFilterModel`。
