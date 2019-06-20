import moment from 'moment';

export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holiday'];
export const monthFormat = 'YYYY-MM';
export const dateFormat = 'YYYY-MM-DD';

/**
 * 时间段拼接
 * @param list
 * @returns {Array}
 */
export function handleTimeUnit(list) {
  const newList = [];
  list.forEach(item => {
    newList.push(`${item.startTime} - ${item.endTime}`);
  });
  return newList;
}

/**
 * 创建临时表格数据
 * @param timeUnit
 * @param value
 * @returns {Array}
 */
export function handleTableDataSource(timeUnit, value) {
  const list = [];
  timeUnit.forEach(item => {
    const object = {};
    object.timeUnit = item;
    days.forEach(day => {
      object[day] = value;
    });
    list.push(object);
  });
  return list;
}

export function getYear(date1, date2) {
  return moment(date1).isSame(date2, 'year') ? moment(date1).year() : undefined;
}

export function getWeek(day) {
  switch (moment(day).day()) {
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
    case 7:
      return 'Sunday';
    default:
      return 'Holiday';
  }
}

export function getWeekChinese(day) {
  switch (day) {
    case 1:
      return '星期一';
    case 2:
      return '星期二';
    case 3:
      return '星期三';
    case 4:
      return '星期四';
    case 5:
      return '星期五';
    case 6:
      return '星期六';
    case 7:
      return '星期日';
    default:
      return '节假日';
  }
}

export function getDay(year, day) {
  return moment(moment().year(year)).dayOfYear(day);
}

export function getMonth(year, month) {
  return moment(moment().year(year)).month(month);
}

export function nextMonth(currentMonth) {
  return moment(moment(currentMonth).add(1, 'months')).format(monthFormat);
}

export function prevMonth(currentMonth) {
  return moment(moment(currentMonth).subtract(1, 'months')).format(monthFormat);
}

function isContainMonth(month1, month2, date) {
  return moment(date).isBetween(month1, month2, 'month')
    || moment(date).isSame(month1, 'month')
    || moment(date).isSame(month2, 'month');
}

/**
 * 获取月份区间集合
 * @param month1
 * @param month2
 * @returns {Array}
 */
export function getMonthBetween(month1, month2) {
  const year = getYear(month1, month2);
  const list = [];
  if (year) {
    for (let i = 0; i < 12; i++) {
      const month = getMonth(year, i);
      if (isContainMonth(month1, month2, month)) {
        list.push(moment(month).format(monthFormat));
      }
    }
  }
  return list;
}

/**
 * 处理全年价格
 * @param startMonth 起始月份
 * @param endMonth 截止月份
 * @param basePrice 基础价格
 * @param list 设置价格目录表 {timeUnit: 时间段}
 * @returns {*}
 */
export function handleYearPriceData(startMonth, endMonth, list, basePrice) {
  const year = getYear(startMonth, endMonth);
  const object = {};
  if (year) {
    for (let i = 1; i <= 366; i++) {
      const day = moment(getDay(year, i)).format(dateFormat);
      if (moment(day).year() === year) {
        // 设置区间价格
        const timeUnitPrice = {};
        list.forEach(item => {
          timeUnitPrice[item.timeUnit] = isContainMonth(startMonth, endMonth, day) ? item[getWeek(day)] : basePrice;
        });
        object[day] = timeUnitPrice;
      }
    }
  }
  return object;
}

export function transWeekToNumber(week) {
  let i = 0;
  days.forEach((item, index) => {
    if (item === week) {
      i = index + 1;
    }
  });
  return i;
}

/**
 * 价格处理
 * @param list
 */
export function handleWeekPriceData(list) {
  const result = {};
  days.forEach(day => {
    const timeUnitValue = {};
    list.forEach(item => {
      timeUnitValue[item.timeUnit] = item[day];
    });
    result[transWeekToNumber(day)] = timeUnitValue;
  });
  return result;
}

export function filterNoDataChange(list) {
  const newList = {...list};
  const sportItems = Object.keys(newList);
  sportItems.forEach(sportItem => {
    const courts = Object.keys(newList[sportItem]);
    courts.forEach(court => {
      const dates = Object.keys(newList[sportItem][court]);
      dates.forEach(date => {
        const timeUnits = Object.keys(newList[sportItem][court][date]);
        timeUnits.forEach(timeUnit => {
          if (newList[sportItem][court][date][timeUnit].status !== 1) {
            delete newList[sportItem][court][date][timeUnit];
          }
        });
      });
    });
  });
  return newList;
}

export function getIsModified() {
  return sessionStorage.getItem('isModified') === 'true';
}

export function setIsModified(flag) {
  sessionStorage.setItem('isModified', flag);
}
