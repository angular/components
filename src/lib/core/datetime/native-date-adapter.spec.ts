import {NativeDateAdapter} from './native-date-adapter';


describe('NativeDateAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
  });

  it('should get year', () => {
    expect(adapter.getYear(new Date(2017, 0, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(new Date(2017, 0, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(new Date(2017, 0, 1))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(new Date(2017, 0, 1))).toBe(0);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('long')).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'
    ]);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('short')).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
  });

  it('should get narrow month names', () => {
    expect(adapter.getMonthNames('narrow')).toEqual([
      'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
    ]);
  });

  it('should get month names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getMonthNames('long')).toEqual([
      '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
    ]);
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDateNames()).toEqual([
      '1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日',
      '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日',
      '25日', '26日', '27日', '28日', '29日', '30日', '31日'
    ]);
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ]);
  });

  it('should get narrow day of week names', () => {
    expect(adapter.getDayOfWeekNames('narrow')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
    ]);
  });

  it('should get year name', () => {
    expect(adapter.getYearName(new Date(2017, 0, 1))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(new Date(2017, 0, 1))).toBe('2017年');
  });

  it('should get long month and year name', () => {
    expect(adapter.getMonthYearName(new Date(2017, 0, 1), 'long')).toBe('January 2017');
  });

  it('should get short month and year name', () => {
    expect(adapter.getMonthYearName(new Date(2017, 0, 1), 'short')).toBe('Jan 2017');
  });

  it('should get narrow month and year name', () => {
    expect(adapter.getMonthYearName(new Date(2017, 0, 1), 'narrow')).toBe('J 2017');
  });

  it('should get month and year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getMonthYearName(new Date(2017, 0, 1), 'long')).toBe('2017年1月');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should create Date', () => {
    expect(adapter.create(2017, 0, 1)).toEqual(new Date(2017, 0, 1));
  });

  it('should create Date with month and date overflow', () => {
    expect(adapter.create(2017, 12, 32)).toEqual(new Date(2018, 1, 1));
  });

  it('should create Date with month date underflow', () => {
    expect(adapter.create(2017, -1, 0)).toEqual(new Date(2016, 10, 30));
  });

  it('should create Date with low year number', () => {
    expect(adapter.create(-1, 0, 1).getFullYear()).toBe(-1);
    expect(adapter.create(0, 0, 1).getFullYear()).toBe(0);
    expect(adapter.create(50, 0, 1).getFullYear()).toBe(50);
    expect(adapter.create(99, 0, 1).getFullYear()).toBe(99);
    expect(adapter.create(100, 0, 1).getFullYear()).toBe(100);
  });

  it('should create Date with low year number and over/under-flow', () => {
    expect(adapter.create(50, 12 * 51, 1).getFullYear()).toBe(101);
    expect(adapter.create(50, 12, 1).getFullYear()).toBe(51);
    expect(adapter.create(50, -12, 1).getFullYear()).toBe(49);
    expect(adapter.create(50, -12 * 51, 1).getFullYear()).toBe(-1);
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), new Date()))
        .toBe(true, "should be equal to today's date");
  });

  it('should parse string', () => {
    expect(adapter.parse('1/1/17')).toEqual(new Date(2017, 0, 1));
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp)).toEqual(new Date(timestamp));
  });

  it ('should parse Date', () => {
    let date = new Date(2017, 0, 1);
    expect(adapter.parse(date)).toEqual(date);
    expect(adapter.parse(date)).not.toBe(date);
  });

  it('should parse invalid value as null', () => {
    expect(adapter.parse('hello')).toBeNull();
  });

  it('should format', () => {
    expect(adapter.format(new Date(2017, 0, 1))).toEqual('1/1/2017');
  });

  it('should format with custom format', () => {
    expect(adapter.format(new Date(2017, 0, 1), {year: 'numeric', month: 'long', day: 'numeric'}))
        .toEqual('January 1, 2017');
  });

  it('should format with a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.format(new Date(2017, 0, 1))).toEqual('2017/1/1');
  });

  it('should add years, months, and days', () => {
    expect(adapter.addDateSpan(new Date(2017, 0, 1), {years: 1, months: 1, days: 1}))
        .toEqual(new Date(2018, 1, 2));
  });

  it('should add negative years, months, and days', () => {
    expect(adapter.addDateSpan(new Date(2017, 0, 1), {years: -1, months: -1, days: -1}))
        .toEqual(new Date(2015, 10, 30));
  });

  it('should clone', () => {
    let date = new Date(2017, 0, 1);
    expect(adapter.clone(date)).toEqual(date);
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(new Date(2017, 0, 1), new Date(2017, 0, 2))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, 0, 1), new Date(2017, 1, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, 0, 1), new Date(2018, 0, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, 0, 1), new Date(2017, 0, 1))).toBe(0);
    expect(adapter.compareDate(new Date(2018, 0, 1), new Date(2017, 0, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, 1, 1), new Date(2017, 0, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, 0, 2), new Date(2017, 0, 1))).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(adapter.clampDate(new Date(2017, 0, 1), new Date(2018, 0, 1), new Date(2019, 0, 1)))
        .toEqual(new Date(2018, 0, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(adapter.clampDate(new Date(2020, 0, 1), new Date(2018, 0, 1), new Date(2019, 0, 1)))
        .toEqual(new Date(2019, 0, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(adapter.clampDate(new Date(2018, 1, 1), new Date(2018, 0, 1), new Date(2019, 0, 1)))
        .toEqual(new Date(2018, 1, 1));
  });
});
