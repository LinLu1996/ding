import moment from 'moment';

export function transMonthToEn(month) {
  switch (Number(month)) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'Mar';
    case 4:
      return 'Apr';
    case 5:
      return 'May';
    case 6:
      return 'Jun';
    case 7:
      return 'Jul';
    case 8:
      return 'Aug';
    case 9:
      return 'Sep';
    case 10:
      return 'Oct';
    case 11:
      return 'Nov';
    case 12:
      return 'Dec';
    default:
      return '';
  }
}

export function getWeek(date) {
  switch (moment(date).isoWeekday()) {
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

export function getWeekChinese (day) {
  switch (day) {
    case 'Monday':
      return '一';
    case 'Tuesday':
      return '二';
    case 'Wednesday':
      return '三';
    case 'Thursday':
      return '四';
    case 'Friday':
      return '五';
    case 'Saturday':
      return '六';
    case 'Sunday':
      return '日';
    default:
      return '节假日';
  }
}
