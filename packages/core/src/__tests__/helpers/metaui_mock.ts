import { MetaUiField, MetaUiGroup, MetaUi } from "../../index";
import { SqlDataType } from "../../metaui/datatype";

/**
 * 构造最小化 MetaUiField 用于测试，不依赖完整元数据
 */
export function createMockField(init?: Partial<MetaUiField>): MetaUiField {
  return new MetaUiField({
    fieldName: "testField",
    displayLabel: "测试字段",
    fieldIdx: 0,
    dataType: SqlDataType.VARCHAR,
    nullable: true,
    listed: true,
    ...init,
  });
}

/**
 * 构造含主表组 + 可选子表 groupUi 的 MetaUi
 */
export function createMockMetaUi(
  fields: MetaUiField[] = [],
  subGroup?: { groupName: string; fields: MetaUiField[] },
): MetaUi {
  const mainGroup = MetaUiGroup.master({
    groupName: "a1",
    groupLabel: "主表组",
    groupIdx: 1,
    fields,
  });

  const groups: MetaUiGroup[] = [mainGroup];

  if (subGroup) {
    const subMetaUi = new MetaUi({
      objName: "SubObj",
      displayLabel: "子对象",
      groups: [
        {
          groupName: subGroup.groupName,
          groupLabel: "子表组",
          many: false,
          fields: subGroup.fields,
        },
      ],
    });
    const sg = MetaUiGroup.sub({
      groupName: subGroup.groupName,
      groupLabel: "子表组",
      groupIdx: 30,
      fields: subGroup.fields,
      joinOn: "id=@id",
      groupUi: subMetaUi,
      many: true,
    } as any);
    groups.push(sg);
  }

  return new MetaUi({
    objName: "TestObj",
    displayLabel: "测试对象",
    groups,
  });
}
