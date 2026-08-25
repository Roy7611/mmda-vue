const calendarEn = {
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ],
}

const calendarZh = {
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthNamesShort: [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ],
}

export const primeVueI18n: Record<string, Record<string, any>> = {
  en: {
    ...calendarEn,
    startsWith: 'Starts with',
    contains: 'Contains',
    notContains: 'Does not contain',
    endsWith: 'Ends with',
    equals: 'Equals',
    notEquals: 'Not equals',
    noFilter: 'No filter',
    lt: 'Less than',
    lte: 'Less than or equal to',
    gt: 'Greater than',
    gte: 'Greater than or equal to',
    clear: 'Clear',
    apply: 'Apply',
    accept: 'Yes',
    reject: 'No',
    choose: 'Choose',
    upload: 'Upload',
    cancel: 'Cancel',
    emptyMessage: 'No available options',
    emptySearchMessage: 'No results found',
  },
  zh: {
    ...calendarZh,
    startsWith: '开头是',
    contains: '包含',
    notContains: '不包含',
    endsWith: '结尾是',
    equals: '等于',
    notEquals: '不等于',
    noFilter: '无筛选',
    lt: '小于',
    lte: '小于等于',
    gt: '大于',
    gte: '大于等于',
    clear: '清除',
    apply: '应用',
    accept: '确定',
    reject: '取消',
    choose: '选择',
    upload: '上传',
    cancel: '取消',
    emptyMessage: '暂无可选项',
    emptySearchMessage: '未找到结果',
  },
}

/** Backwards-compatible spelling used by the old package. */
export const primevueI18n = primeVueI18n
