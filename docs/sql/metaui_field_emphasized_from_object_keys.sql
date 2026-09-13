-- =============================================================================
-- 把 metaobject 上的关键列标成 metauifield.emphasized
-- =============================================================================
-- 库：mmda_metadata
-- metaobject：uniqueKey / nameCol / thumbnailCol / parentIdCol
-- metauifield 主键只有 fieldName → 同名字段会一起亮
-- 运行时顶栏只认 field.emphasized；本脚本只补库，客户端不推断
--
-- 用法：先跑预览；UPDATE 放事务里，确认后再 COMMIT；改完清 MetaUi 缓存
-- =============================================================================

USE mmda_metadata;

-- 预览：将要点亮的 fieldName（及来源角色）
SELECT f.fieldName,
       f.emphasized,
       GROUP_CONCAT(DISTINCT k.role ORDER BY k.role) AS roles,
       COUNT(DISTINCT CONCAT(o.dbName, '.', o.objName)) AS obj_cnt
FROM metauifield f
INNER JOIN (
  SELECT uniqueKey AS fieldName, 'uniqueKey' AS role FROM metaobject
  WHERE uniqueKey IS NOT NULL AND TRIM(uniqueKey) <> ''
  UNION ALL
  SELECT nameCol, 'nameCol' FROM metaobject
  WHERE nameCol IS NOT NULL AND TRIM(nameCol) <> ''
  UNION ALL
  SELECT thumbnailCol, 'thumbnailCol' FROM metaobject
  WHERE thumbnailCol IS NOT NULL AND TRIM(thumbnailCol) <> ''
  UNION ALL
  SELECT parentIdCol, 'parentIdCol' FROM metaobject
  WHERE parentIdCol IS NOT NULL AND TRIM(parentIdCol) <> ''
) k ON k.fieldName = f.fieldName
INNER JOIN metaobject o
  ON o.uniqueKey = f.fieldName
  OR o.nameCol = f.fieldName
  OR o.thumbnailCol = f.fieldName
  OR o.parentIdCol = f.fieldName
GROUP BY f.fieldName, f.emphasized;

START TRANSACTION;

UPDATE metauifield f
INNER JOIN (
  SELECT uniqueKey AS fieldName FROM metaobject
  WHERE uniqueKey IS NOT NULL AND TRIM(uniqueKey) <> ''
  UNION
  SELECT nameCol FROM metaobject
  WHERE nameCol IS NOT NULL AND TRIM(nameCol) <> ''
  UNION
  SELECT thumbnailCol FROM metaobject
  WHERE thumbnailCol IS NOT NULL AND TRIM(thumbnailCol) <> ''
  UNION
  SELECT parentIdCol FROM metaobject
  WHERE parentIdCol IS NOT NULL AND TRIM(parentIdCol) <> ''
) k ON k.fieldName = f.fieldName
SET f.emphasized = b'1'
WHERE f.emphasized = b'0';

-- 抽查
-- SELECT fieldName, emphasized FROM metauifield
-- WHERE fieldName IN ('materialCode','materialName','parentId');

COMMIT;
-- ROLLBACK;
