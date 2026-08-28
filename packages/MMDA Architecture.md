# MMDA 前端架构

## 架构设计

![MMDA 架构](/docs/images/mmda-vue.drawio.png)

- 数据层：与云端接口交互获取、提交数据，提供元数据、实体模型框架，从元数据创建实体模型、数据转换、计算、校验，工具库
- 逻辑层：核心是界面逻辑、字段域逻辑、子表分组逻辑。包括依赖注入。
- UI层：负责给用户显示数据，接受用户交互并提交数据给逻辑层

### 数据层

数据层（core/data）主要包含以下内容：

- [metaui](/packages/core/docs/metaui.md) 元数据模式定义数据模型的字段、分组、子表组和引用关系
  - Module(`MetaModule`)
  - ModuleAction -> UiAction(`MetaUiAction`)
- [models](/packages/core/docs/models.md) 实体框架提供：
  - Entity 实体
  - EntityState 实体状态
  - ValueObject 值对象，实体的引用项，例如枚举、关联对象
  - EntityAction 实体动作，指业务领域的操作定义
  - EntityArray 实体集合
  - Sort 排序 / SortSet 多字段排序
  - Paginator 分页请求
  - Pagination 分页结果
  - PagedList 分页的实体集合，包含实体集合和分页结果（EntityArray + Pagination）
  - EntityRefParam 实体引用参数是实体间的引用关系
  - EntitySearchParam 实体搜索查询参数
- [net](/packages/core/docs/net.md) 网络API客户端，标准化错误处理。
- [utils](/packages/core/docs/utils.md) 工具包
- [extensions](/packages/core/docs/extensions.md) 类型扩展

#### API客户端（ApiClient）

API 客户端负责于云端接口进行交互，参考[Api 客户端文档](/packages/core/docs/net.md)

#### API错误处理（ApiError）

[RFC 9457 Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) 定义了标准的HTTP API 问题详情，问题详情可以与任何 HTTP 状态码一起使用, 但它们最自然地契合 4xx 和 5xx 响应的语义。媒体类型使用`application/problem+json`，如果序列化为xml，则使用`application/problem+xml`，使用的语言可以使用 `Accept-Language` 请求头字段进行协商。

问题详情的[Problem Details JSON 对象](https://rfcinfo.com/zh-Hans/rfc-9457/3-problem-details-json-object)定义了标准字段：

- `type` 标识问题类型，包含标识问题类型的 URI 引用
- `status` 表示源服务器为此次问题发生实例生成的 HTTP 状态码，是一个数字
- `title` 指出原因，包含问题类型的简短、人类可读摘要
- `instance` 标识具体的问题发生实例，包含标识问题特定发生实例的 URI 引用
- `detail` 给出特定于该发生实例的细节，包含特定于此次问题发生实例的人类可读解释
- 扩展成员：你可以自行扩展其他字段，提供更多信息

为了在表单验证时提供字段级服务器端验证错误，扩展`errors`成员，提供给UI层展现问题的位置：

```json
errors:[
  {
    "field1": "error desc", //主表字段1
  },
  {
    "items.field2": "error desc", //子表items的字段2
    "rowid": 2 //第2行
  }
]
```

详情页面在执行`Action`的时候，也可能返回问题详情，需要在页面上标记和展示是哪些具体字段出现问题，便于用户修正和重试。

注：目前还没移植完成，需要服务器端先调整。

### 逻辑层

核心是`UiLogic`，`MetaUiFieldLogic` 字段域逻辑（原接口太胖），重构为渲染逻辑、编辑逻辑、单元格编辑逻辑、查询过滤逻辑（UiFieldFilterLogic）。

- 编辑逻辑包括：
  - 只读锁定条件 lockIf(Predicate&lt;E&gt;)
  - 隐藏条件 hideIf(Predicate&lt;E&gt;)
  - 必填条件 requiredIf(Predicate&lt;E&gt;)
  - 数据修改事件函数 onChange<E,F>(entity,field,newValue,oldValue)
  - 设置自定义渲染器 setCustomRenderer(UiFieldRenderer)，渲染器包含格式化逻辑
  - 设置自定义编辑器 setCustomEditor(UiFieldRenderer)
  - 设置自定义校验器 setValidator(UiFieldValidator) 可多次调用叠加，返回是否阻止保存，有只警告的场景，分Error/Warning
  
- `UiFieldCellEditLogic` 字段域单元格编辑逻辑继承UiFieldEditLogic，但可以针对表格编辑做一些不同的改造，例如渲染器和编辑器可以不同
  - filterable 可过滤，编辑时一般不过滤，也有例外
  - sortable 可排序，编辑时一般不排序
  - filterOptions 过滤选项（searchOptions？）
  - ...
- `UiFieldFilterLogic` 查询字段域逻辑，例如业务需要的额外限制
  - 自定义选择项和数据源 setFilter(UiFieldFilterer) 可叠加
  - 自定义操作符
  - 自定义选择器控件 setSelector
- `UiSubGroupLogic` 子表分组逻辑，
  - 添加数据即选择器配置`addSelector`

### UI层

`vui`是基于[Vue](https://vuejs.org/)渲染函数实现的UI基础库，定义了：

- `UiApp` 应用脚手架包括MmdaApplication, MmdaApplicationContext（模块树、皮肤、Todo等）, 面包屑、工具栏、搜索栏构建参数
- `UiLayout` 布局，包括域、组、屏幕的布局选项和默认布局实现
- `UiBuildContext` 实现Vue双向绑定、交互逻辑、国际化、选择器等UI构建上下文，实现`UiContext`接口
- `UiFactory` 提供一套控件渲染接口，具体由控件库实现，参考vui-prime, vue-syncfusion等
- `UiBuilder` 提供一套应用程序组件UI渲染接口，具体由控件库实现
- `UiDialog` 对话框参数类型定义
- `UiSelector`是特殊的index视图，选择的同时要允许创建
- `UiAction` 从core/EntityAction创建的UI层命令构建参数，包括回调函数
- `UiMenu` 菜单构建参数，包含UiAction
- `UiButton` 按钮构建参数
- `UiView` 视图类型定义、视图构建参数
- `UiList` 列表视图类型、分页器定义、构建参数

#### UiContext 上下文设计

`UiContext`是交互逻辑（`UiLogic`）Vue化后的产物，用来为UI层构建界面元素提供上下文，包括实体模型数据绑定、字段属性访问、关联数据选择、格式化、国际化、Action命令函数、App全局环境访问、页面导航等。

`UiLogic`中有程序员纯ts/js写的交互逻辑函数。

在不同的页面下逻辑有较大差异，目前各类视图（分index / edit / details / select[One|Many]）逻辑混在一块，是一个极胖接口，不好维护。实际上有：

1. 索引页（`UiIndexContext`）：没必要每行都构建上下文，只读页面无需响应式双向绑定，一个上下文即可
2. 编辑页（`UiEditContext`）：子表如果在表格中直接编辑（CellEditor），需响应式双向绑定，整个页面需构建一个上下文树，每行一个上下文，并可通过root context访问页面上下文
3. 详情页（`UiDetailsContext`）：子表只读无需响应式双向绑定，一个子表一个上下文单向绑定，支持点击内容编辑一个字段（In place Editor），特别适合流程处理过程只能编辑部分字段的场景。In place Edit不用双向绑定，即时提交服务器保存。

类似购物APP的地址选择功能，在对话框中需要选择数据的时候，可以添加数据。这里涉及页面间导航、数据传递、上下文切换。

## 功能设计

### 索引页（index page）

![index](/docs/images/mmda-vue-index.drawio.png)

索引页程序分三个步骤：

1. 获取元数据：通过`MetaUiService`从本地缓存或者服务器获取元数据，用于配置表格列头和单元格渲染器
2. 获取数据：实体逻辑（`EntityLogic`）负责组装查询参数，通过GetAll / SearchAll(Post)调用API获取分页数据
3. 显示数据：借助单元格渲染器（`CellRenderer`）配置表格列，然后单向绑定数据（EntityArray）和分页结果（Pagination）

索引页具有如下功能（增强）：

- 翻页：修改分页器查询参数，查询参数为响应式，只要修改触发事件`onRefresh`
- 表头排序：Shift+点击表头可多列排序，触发事件`onRefresh`重新查询，支持默认排序回到起始
- 模糊搜索：通过`searchWord`响应式触发查询
- 表头过滤：表头有下拉过滤器，支持多选、文本、数值等不同类型的过滤器，参考ag-grid的`FilterModel`，放在SearchParam中，调用SearchAll接口
- 选择行：Ctrl + 鼠标单击多选 / Shift + 鼠标单击连续多选，支持复选框多选
- 删除：删除选中的行，不再需要单独的批量删除视图
- 显示设置：弹出对话框，打勾设置表格列可见性，拖曳修改列顺序，甚至修改列标题，保存用户设置为显示模式（ListViewMode 需服务器支持）
- 统计报表：此功能的权限替代原来的`PRINT`,打印通过导出PDF实现。支持多维表格分析，图表展示
- 导航至详情、创建/编辑页，每个实体都有id,title属性（MetaObject.nameCol 支持字段表达式），渲染为一个超链接+编辑图标，便于导航。保留每一行的下拉操作菜单，如果组装了EntityAction，固定在右边渲染一列
- 导入功能改进为弹出对话框

  1. 可预览导入结果，错误单元格位置和原因（参考招行桌面端）
  2. 可拖曳文件自动上传
  3. 可先导出空Excel文件模板，下拉数据选填，然后导入

- 导出功能改进为弹出对话框

  1. 可设置和上传模板（uploadTemplate 权限分开）
  2. 选择模板、临时在线设计Excel报表模板并保存（借助SpreadSheet）
  3. 可设置数据源：仅主表 / 主从模式

- 其他功能增强

  1. 性能考虑行不使用绑定（或者仅单向绑定），超过50行激活虚拟滚动，默认20行，支持1000行+数据加载
  2. Link + EditIcon 导航至详情 / 编辑，Ctrl / Shift多选删除
  3. Aggregator 设置，显示统计数据 / 图表
  4. 类似Excel的数据过滤器，保留自定义查询功能（QueryBuilder / saveQuery / 输入参数重新查询）
  5. 一并显示主/从数据（金蝶模式）
  6. PivotTable多维分析（权限控制 print => report）

由于我们有引用字段，通常是一个`long id`，需要显示关联实体的title文本。因此表格需要支持自定义CellRenderer<E,F> = (ctx,fld,row,value) => VNode，相应的过滤器实现。

[AgGrid Cell Render](https://www.ag-grid.com/vue-data-grid/component-cell-renderer/)，单元格渲染流程参见 [Cell Content](https://www.ag-grid.com/vue-data-grid/cell-content/)

### 编辑页（edit page）

### 详情页（details page）
