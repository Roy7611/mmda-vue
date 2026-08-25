// 元数据类型
//
// 让你可以获得实体[Entity]属性的dart数据类型[Type]
export enum SqlDataType {
  CHAR = 0, //字符
  UNIQUEIDENTIFIER = 15, //唯一标
  NCHAR = 16, //字符(UNICODE)
  VARCHAR = 32, //字符串
  HIERARCHYID = 33, //层次标识
  NVARCHAR = 48, //字符串(UNICODE
  XML = 49, //XML
  TINYINT = 65, //整型(微小)
  SMALLINT = 66, //整型(小)
  MEDIUMINT = 67, //整型(中)
  INT = 68, //整型
  BIGINT = 72, //整型(大)
  DECIMAL = 81, //数值
  NUMERIC = 83, //数值
  FLOAT = 84, //数值(单精度)
  DOUBLE = 88, //数值(双精度)
  SMALLMONEY = 100, //货币(小)
  MONEY = 104, //货币
  BITARRAY = 112, //位数组
  BIT = 113, //布尔
  TIME = 147, //时间
  YEAR = 161, //年
  YEAR_MONTH = 162, //年月
  DATE = 163, //日期
  SMALLDATETIME = 180, //日期时间
  DATETIME = 184, //日期时间
  DATETIME2 = 185, //日期时间2
  DATETIMEOFFSET = 186, //日期时
  TIMESTAMP = 191, //时间戳
  BINARY = 192, //二进制
  TINYBLOB = 193, //二进制对象(微
  BLOB = 194, //二进制对象
  MEDIUMBLOB = 196, //二进制对象(
  LONGBLOB = 200, //二进制对象(长
  VARBINARY = 208, //二进制(可变
  LONGVARBINARY = 209, //长二进制
  TINYTEXT = 225, //文本(微小)
  TEXT = 226, //文本
  MEDIUMTEXT = 228, //文本(中)
  LONGTEXT = 232, //文本(长)
  NTEXT = 239, //文本(UNICODE)
  GEOGRAPHY = 241, //地理
  GEOMETRY = 242, //几何数据
  SQL_VARIANT = 255, //可变型
}

export const JsDataType = {
  CHAR: 'string', //字符
  UNIQUEIDENTIFIER: 'string', //唯一标
  NCHAR: 'string', //字符(UNICODE)
  VARCHAR: 'string', //字符串
  HIERARCHYID: 'string', //层次标识
  NVARCHAR: 'string', //字符串(UNICODE
  XML: 'string', //XML
  TINYINT: 'number', //整型(微小)
  SMALLINT: 'number', //整型(小)
  MEDIUMINT: 'number', //整型(中)
  INT: 'number', //整型
  BIGINT: 'BigInt', //整型(大)
  DECIMAL: 'number', //数值
  NUMERIC: 'number', //数值
  FLOAT: 'number', //数值(单精度)
  DOUBLE: 'number', //数值(双精度)
  SMALLMONEY: 'number', //货币(小)
  MONEY: 'number', //货币
  BITARRAY: 'number', //位数组
  BIT: 'boolean', //布尔
  TIME: 'string', //时间
  YEAR: 'number', //年
  YEAR_MONTH: 'number', //年月
  DATE: 'Date', //日期
  SMALLDATETIME: 'Date', //日期时间
  DATETIME: 'Date', //日期时间
  DATETIME2: 'Date', //日期时间2
  DATETIMEOFFSET: 'Date', //日期时
  TIMESTAMP: 'Date', //时间戳
  BINARY: 'Blob', //二进制
  TINYBLOB: 'Blob', //二进制对象(微
  BLOB: 'Blob', //二进制对象
  MEDIUMBLOB: 'Blob', //二进制对象(
  LONGBLOB: 'Blob', //二进制对象(长
  VARBINARY: 'Blob', //二进制(可变
  LONGVARBINARY: 'Blob', //长二进制
  TINYTEXT: 'string', //文本(微小)
  TEXT: 'string', //文本
  MEDIUMTEXT: 'string', //文本(中)
  LONGTEXT: 'string', //文本(长)
  NTEXT: 'string', //文本(UNICODE)
  GEOGRAPHY: 'string', //地理
  GEOMETRY: 'string', //几何数据
  SQL_VARIANT: 'any', //可变型
}

//bindts
export namespace SqlDataType {
  export function isBool(dt: SqlDataType) {
    return dt == SqlDataType.BIT
  }

  export function isInt(dt: SqlDataType) {
    return dt >= SqlDataType.TINYINT && dt <= SqlDataType.INT //BIGINT as string?
  }
  export function isBigInt(dt: SqlDataType) {
    return dt == SqlDataType.BIGINT
  }
  export function isNum(dt: SqlDataType) {
    return (
      dt >= SqlDataType.TINYINT && dt <= SqlDataType.BITARRAY && !isBigInt(dt)
    )
  }
  export function isFloat(dt: SqlDataType) {
    return dt == SqlDataType.FLOAT || dt == SqlDataType.DOUBLE
  }
  export function isDate(dt: SqlDataType) {
    return dt >= SqlDataType.DATE && dt <= SqlDataType.TIMESTAMP
  }
  export function isDateTime(dt: SqlDataType) {
    return dt > SqlDataType.DATE && dt <= SqlDataType.TIMESTAMP
  }
  export function isBlob(dt: SqlDataType) {
    return dt >= SqlDataType.BINARY && dt <= SqlDataType.LONGVARBINARY
  }
  export function isVariant(dt: SqlDataType) {
    return dt == SqlDataType.SQL_VARIANT
  }
}

export function defaultDataTypeValue(dt: SqlDataType, val?: string) {
  if (val !== undefined && val !== null) {
    if (SqlDataType.isBool(dt)) return !!Number(val)
    else if (SqlDataType.isNum(dt)) return Number(val)
    else if (SqlDataType.isDateTime(dt)) return new Date().toSQL()
    else if (SqlDataType.isBlob(dt)) return new Blob()
    else {
      switch (dt) {
        case SqlDataType.TIME:
          return new Date().toSQLTime()
        case SqlDataType.DATE:
          return new Date().toSQLDate()
        case SqlDataType.YEAR:
        case SqlDataType.YEAR_MONTH:
          return Number(val)
        default:
          return val
      }
    }
  }
  return null
}
