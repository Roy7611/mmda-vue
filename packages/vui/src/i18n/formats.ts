export const numberFormats:Record<string,any> = {
  en: {
    currency: {
      style: 'currency', currency: 'USD', notation: 'standard'
    },
    decimal: {
      style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
    },
    percent: {
      style: 'percent', useGrouping: false
    },
    words: {
      numbers: "zero,one,two,three,four,five,six,seven,eight,nine",
      teens: "ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen,seventeen,eighteen,nineteen",
      tens: ",,twenty,thirty,forty,fifty,sixty,seventy,eighty,ninety",
      point: "point",
      zerosAnd: "and ",
      tensAnd: "-",
      hundredsAnd: "and ",
      radices: ",,hundred",
      groupingSymbol: ",",
      groupingRadices: ",thousand,million,billion,trillion,quadrillion,quintillion,sextillion,septillion,octillion,nonillion",
      currencyUnits: "dollar,,cent",
      currencyUnitPosition: "start",
      onlyInteger: "only",
    }
  },
  zh: {
    currency: {
      style: 'currency', currency: 'CNY', useGrouping: true, currencyDisplay: 'symbol'
    },
    decimal: {
      style: 'decimal', minimumSignificantDigits: 3, maximumSignificantDigits: 5
    },
    percent: {
      style: 'percent', useGrouping: false
    }
  },
  'zh-Hant': {
    currency: {
      style: 'currency', currency: 'CNY', useGrouping: true, currencyDisplay: 'symbol'
    },
    decimal: {
      style: 'decimal', minimumSignificantDigits: 3, maximumSignificantDigits: 5
    },
    percent: {
      style: 'percent', useGrouping: false
    }
  }
}

export const datetimeFormats:Record<string,any> = {
  en: {
    short: {
      year: 'numeric', month: 'short', day: 'numeric'
    },
    long: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric'
    }
  },
  zh: {
    short: {
      year: 'numeric', month: 'short', day: 'numeric'
    },
    long: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
    }
  },
  'zh-Hant': {
    short: {
      year: 'numeric', month: 'short', day: 'numeric'
    },
    long: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
    }
  }
}