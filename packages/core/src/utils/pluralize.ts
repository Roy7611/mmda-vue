/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:16:04
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-04-24 10:56:08
 * @FilePath: /mmda-vue/packages/core/src/utils/pluralize.ts
 * 单词复数。不规则规则是领域词（Equipment、Person 等），长期应随应用走。
 */
import _p from 'pluralize'

// addIrregularRule:添加不规则规则
_p.addPluralRule(/gex$/i, 'gexii')
_p.addIrregularRule('I', 'we')
_p.addIrregularRule('Equipment', 'Equipments')
_p.addIrregularRule('Person', 'Persons')
_p.addIrregularRule('ProjectSettlement', 'ProjectSettlements')
_p.addUncountableRule('paper')

// 单词复数转换
export const pluralize = _p
