import { Component } from "@syncfusion/ej2-base";
import {
  CheckBoxFilterBase,
  Edit,
  Filter,
  Grid,
  Group,
  Page,
  Pager,
  PagerDropDown,
  Resize,
  Selection,
  Sort,
  VirtualScroll,
} from "@syncfusion/ej2-grids";

/**
 * Vue 属性 watcher 会在 appendTo/preRender 之前或 destroy 之后调用 dataBind→injectModules。
 * 此时 Grid.serviceLocator 仍为空，Selection 构造里 locator.getService 会炸。
 * Selection 是默认模块，只要 allowSelection 就会装载。
 */
const originalInjectModules = (Component.prototype as any).injectModules;
if (typeof originalInjectModules === "function") {
  (Component.prototype as any).injectModules = function injectModulesSafe(
    this: any,
  ) {
    if (
      typeof this.getModuleName === "function" &&
      this.getModuleName() === "grid" &&
      !this.serviceLocator
    ) {
      return;
    }
    return originalInjectModules.call(this);
  };
}

export const SF_GRID_MODULES = [
  Edit,
  Sort,
  Filter,
  Group,
  Selection,
  Page,
  Resize,
  VirtualScroll,
];

Grid.Inject(...SF_GRID_MODULES);
Pager.Inject(Page, PagerDropDown);

/**
 * 表单下拉有 fields.text，Grid CheckBox 筛选没有：
 * 它把列值（enum 的 code / 引用 id）写成勾选文字，还会 getDistinct + 按值排序。
 * 引用选项已经唯一且有顺序，这里只补两件事：用 labelOf 文本、保持 refOptions 原序。
 */
let choiceFilterPatched = false;
export const patchChoiceFilter = () => {
  if (choiceFilterPatched) return;
  choiceFilterPatched = true;
  const originalCreate = CheckBoxFilterBase.prototype.createCheckbox;
  CheckBoxFilterBase.prototype.createCheckbox = function (
    value: unknown,
    checked: boolean,
    data: any,
  ) {
    const text = data?.text ?? data?.dataObj?.text;
    if (text != null && String(text).length) value = String(text);
    return originalCreate.call(this, value, checked, data);
  };
  const originalDistinct = CheckBoxFilterBase.getDistinct;
  CheckBoxFilterBase.getDistinct = function (
    json: any[],
    field: string,
    column: any,
    foreignKeyData: any,
    checkboxFilter: any,
  ) {
    if (
      Array.isArray(json) &&
      json.length > 0 &&
      json.every((item) => item?.__mmdaChoice)
    ) {
      return {
        records: json.map((item) => ({
          ...item,
          ejValue: item[field],
          dataObj: item,
        })),
      };
    }
    return originalDistinct.call(
      this,
      json,
      field,
      column,
      foreignKeyData,
      checkboxFilter,
    );
  };
};
