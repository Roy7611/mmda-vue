-- =============================================================================
-- MetaUiField.renderer / editor：两种命名习惯互转
-- =============================================================================
-- PascalCase（旧元数据 / EJ2 习惯）  ↔  camelCase（vui UiFieldFactory 正式名）
-- 映射真源：packages/vui-*/**/field_factory* 里的 aliases
--
-- 使用前请确认：
--   1) 表名（下方默认 MetaUiField；按环境改成 your_db.MetaUiField）
--   2) 列名是否就是 renderer / editor
--   3) 先跑「预览」；UPDATE 放在事务里，确认后再 COMMIT
-- =============================================================================

-- SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 0. 映射表（临时）
--    old_name = Pascal / 历史别名
--    new_name = camelCase 正式名
--    preferred=1：camel→Pascal 时用的规范旧名（多对一时不可无损还原）
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_mmda_field_ui_alias;
CREATE TEMPORARY TABLE tmp_mmda_field_ui_alias (
  old_name   VARCHAR(64) NOT NULL,
  new_name   VARCHAR(64) NOT NULL,
  preferred  TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (old_name),
  KEY ix_new (new_name, preferred)
);

INSERT INTO tmp_mmda_field_ui_alias (old_name, new_name, preferred) VALUES
  ('TextBox',              'textInput',            1),
  ('TextField',            'textInput',            0),
  ('TextArea',             'textArea',             1),
  ('AutoComplete',         'autoComplete',         1),
  ('TagAutoComplete',      'tagAutoComplete',      1),
  ('DropDownList',         'dropDownList',         1),
  ('RadioButtonGroup',     'radioButtonGroup',     1),
  ('Combobox',             'comboBox',             1),
  ('SearchBox',            'searchBox',            1),
  ('AssociationTable',     'associationTable',     1),
  ('CheckBoxList',         'checkBoxList',         1),
  ('BitCheckBoxList',      'bitCheckBoxList',      1),
  ('MultiSelect',          'multiSelect',          1),
  ('MultiItemSelect',      'multiItemSelect',      1),
  ('MultiValueSelect',     'multiValueSelect',     1),
  ('MultiTextSelect',      'multiTextSelect',      1),
  ('MultiBitSelect',       'multiBitSelect',       1),
  ('DatePicker',           'datePicker',           1),
  ('DateTimePicker',       'dateTimePicker',       1),
  ('MonthPicker',          'monthPicker',          1),
  ('TimePicker',           'timePicker',           1),
  ('DateRangePicker',      'dateRangePicker',      1),
  ('NumberInput',          'numberInput',          1),
  ('SpinBox',              'numberInput',          0),
  ('ToHoursInput',         'toHoursInput',         1),
  ('ToMinutesInput',       'toMinutesInput',       1),
  ('ToSecondsInput',       'toSecondsInput',       1),
  ('PositiveNumberInput',  'positiveNumberInput',  1),
  ('NegativenumberInput',  'negativenumberInput',  1),
  ('PercentInput',         'percentInput',         1),
  ('CheckBox',             'checkbox',             1),
  ('Checkbox',             'checkbox',             0),
  ('Switch',               'switch',               1),
  ('Switcher',             'switch',               0),
  ('Slider',               'slider',               1),
  ('Rating',               'rating',               1),
  ('ColorPicker',          'colorPicker',          1),
  ('ColorBox',             'colorBox',             1),
  ('SignaturePad',         'signaturePad',         1),
  ('Stepper',              'stepper',              1),
  ('ProgressBar',          'progressBar',          1),
  ('FilePicker',           'filePicker',           1),
  ('FileUpload',           'fileUpload',           1),
  ('FileUploader',         'fileUploader',         1),
  ('FilesUploader',        'filesUploader',        1),
  ('ImagePicker',          'imagePicker',          1),
  ('ImageUploader',        'imageUploader',        1),
  ('ImagesUploader',       'imagesUploader',       1),
  ('FileLink',             'fileLink',             1),
  ('Url',                  'fileLink',             0),
  ('MultilineText',        'multilineText',        1),
  ('Percentage',           'percentage',           1),
  ('AmountText',           'amountText',           1),
  ('QuantityUnit',         'quantityUnit',         1),
  ('Tag',                  'tag',                  1),
  ('Tags',                 'tags',                 1),
  ('Chips',                'chips',                1),
  ('EnumChipSet',          'enumChipSet',          1),
  ('BitChipSet',           'bitChipSet',           1),
  ('CheckIcon',            'checkIcon',            1),
  ('CheckedIcon',          'checkedIcon',          1),
  ('HasOneText',           'externalLink',         1),
  ('Timeline',             'timeline',             1),
  ('RelativeTime',         'relativeTime',         1),
  ('Image',                'image',                1),
  ('StatusLight',          'statusLight',          1);

-- ---------------------------------------------------------------------------
-- 1. 预览：库里 renderer / editor 取值分布
-- ---------------------------------------------------------------------------
SELECT renderer AS name, 'renderer' AS col, COUNT(*) AS cnt
FROM MetaUiField
WHERE renderer IS NOT NULL AND TRIM(renderer) <> ''
GROUP BY renderer
UNION ALL
SELECT editor, 'editor', COUNT(*)
FROM MetaUiField
WHERE editor IS NOT NULL AND TRIM(editor) <> ''
GROUP BY editor
ORDER BY col, cnt DESC;

-- 预览：Pascal → camel 将改动的行（列名按你库结构调整）
SELECT f.fieldName, f.renderer, a.new_name AS renderer_to,
       f.editor, b.new_name AS editor_to
FROM MetaUiField f
LEFT JOIN tmp_mmda_field_ui_alias a ON a.old_name = f.renderer
LEFT JOIN tmp_mmda_field_ui_alias b ON b.old_name = f.editor
WHERE a.old_name IS NOT NULL OR b.old_name IS NOT NULL;

-- 预览：camel → Pascal（preferred）将改动的行
SELECT f.fieldName, f.renderer, a.old_name AS renderer_to,
       f.editor, b.old_name AS editor_to
FROM MetaUiField f
LEFT JOIN tmp_mmda_field_ui_alias a ON a.new_name = f.renderer AND a.preferred = 1
LEFT JOIN tmp_mmda_field_ui_alias b ON b.new_name = f.editor   AND b.preferred = 1
WHERE a.new_name IS NOT NULL OR b.new_name IS NOT NULL;

-- =============================================================================
-- 2. PascalCase → camelCase（推荐：迁到工厂正式名）
-- =============================================================================
/*
START TRANSACTION;

UPDATE MetaUiField f
INNER JOIN tmp_mmda_field_ui_alias a ON a.old_name = f.renderer
SET f.renderer = a.new_name
WHERE f.renderer IS NOT NULL AND TRIM(f.renderer) <> '';

UPDATE MetaUiField f
INNER JOIN tmp_mmda_field_ui_alias a ON a.old_name = f.editor
SET f.editor = a.new_name
WHERE f.editor IS NOT NULL AND TRIM(f.editor) <> '';

-- 可选校验：不应再命中 old_name
-- SELECT renderer, COUNT(*) FROM MetaUiField
-- WHERE renderer IN (SELECT old_name FROM tmp_mmda_field_ui_alias) GROUP BY renderer;
-- SELECT editor, COUNT(*) FROM MetaUiField
-- WHERE editor IN (SELECT old_name FROM tmp_mmda_field_ui_alias) GROUP BY editor;

COMMIT;
-- ROLLBACK;
*/

-- =============================================================================
-- 3. camelCase → PascalCase（反向；多对一只还原 preferred）
--    TextField/SpinBox/Url 等会并到 TextBox/NumberInput/FileLink
-- =============================================================================
/*
START TRANSACTION;

UPDATE MetaUiField f
INNER JOIN tmp_mmda_field_ui_alias a ON a.new_name = f.renderer AND a.preferred = 1
SET f.renderer = a.old_name
WHERE f.renderer IS NOT NULL AND TRIM(f.renderer) <> '';

UPDATE MetaUiField f
INNER JOIN tmp_mmda_field_ui_alias a ON a.new_name = f.editor AND a.preferred = 1
SET f.editor = a.old_name
WHERE f.editor IS NOT NULL AND TRIM(f.editor) <> '';

COMMIT;
-- ROLLBACK;
*/

-- DROP TEMPORARY TABLE IF EXISTS tmp_mmda_field_ui_alias;
