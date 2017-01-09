/** Date locale info. TODO(mmalerba): Integrate with i18n solution once we know what we're doing. */
export class DateLocale {
  firstDayOfWeek = 0;

  months = [
    { full: 'January', short: 'Jan' },
    { full: 'February', short: 'Feb' },
    { full: 'March', short: 'Mar' },
    { full: 'April', short: 'Apr' },
    { full: 'May', short: 'May' },
    { full: 'June', short: 'Jun' },
    { full: 'July', short: 'Jul' },
    { full: 'August', short: 'Aug' },
    { full: 'September', short: 'Sep' },
    { full: 'October', short: 'Oct' },
    { full: 'November', short: 'Nov' },
    { full: 'December', short: 'Dec' },
  ];

  days = [
    { full: 'Sunday', short: 'Sun', xshort: 'S' },
    { full: 'Monday', short: 'Mon', xshort: 'M' },
    { full: 'Tuesday', short: 'Tue', xshort: 'T' },
    { full: 'Wednesday', short: 'Wed', xshort: 'W' },
    { full: 'Thursday', short: 'Thu', xshort: 'T' },
    { full: 'Friday', short: 'Fri', xshort: 'F' },
    { full: 'Saturday', short: 'Sat', xshort: 'S' },
  ];

  getDateLabel(d: number) { return `${d}`; }

  getMonthLabel(m: number, y: number) { return `${this.months[m].short.toUpperCase()} ${y}`; }

  getYearLabel(y: number) { return `${y}`; }
}
