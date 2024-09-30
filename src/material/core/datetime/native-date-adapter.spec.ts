import {LOCALE_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Platform} from '@angular/cdk/platform';
import {DEC, FEB, JAN, MAR} from '../../testing';
import {DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter, NativeDateModule} from './index';

describe('NativeDateAdapter', () => {
  let adapter: NativeDateAdapter;
  let assertValidDate: (d: Date | null, valid: boolean) => void;
  let platform: Platform;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [NativeDateModule]});
    adapter = TestBed.inject(DateAdapter) as NativeDateAdapter;
    platform = TestBed.inject(Platform);

    assertValidDate = (d: Date | null, valid: boolean) => {
      expect(adapter.isDateInstance(d))
        .not.withContext(`Expected ${d} to be a date instance`)
        .toBeNull();
      expect(adapter.isValid(d!))
        .withContext(
          `Expected ${d} to be ${valid ? 'valid' : 'invalid'}, but ` +
            `was ${valid ? 'invalid' : 'valid'}`,
        )
        .toBe(valid);
    };
  });

  it('should get year', () => {
    expect(adapter.getYear(new Date(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(new Date(2017, JAN, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(new Date(2017, JAN, 1))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(new Date(2017, JAN, 1))).toBe(0);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('long')).toEqual([
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]);
  });

  it('should get short month names', () => {
    expect(adapter.getMonthNames('short')).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]);
  });

  it('should get narrow month names', () => {
    expect(adapter.getMonthNames('narrow')).toEqual([
      'J',
      'F',
      'M',
      'A',
      'M',
      'J',
      'J',
      'A',
      'S',
      'O',
      'N',
      'D',
    ]);
  });

  it('should get month names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getMonthNames('long')).toEqual([
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ]);
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDateNames()).toEqual([
      '1日',
      '2日',
      '3日',
      '4日',
      '5日',
      '6日',
      '7日',
      '8日',
      '9日',
      '10日',
      '11日',
      '12日',
      '13日',
      '14日',
      '15日',
      '16日',
      '17日',
      '18日',
      '19日',
      '20日',
      '21日',
      '22日',
      '23日',
      '24日',
      '25日',
      '26日',
      '27日',
      '28日',
      '29日',
      '30日',
      '31日',
    ]);
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
  });

  it('should get narrow day of week names', () => {
    expect(adapter.getDayOfWeekNames('narrow')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日',
    ]);
  });

  it('should get year name', () => {
    expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017');
  });

  it('should get year name for low year numbers', () => {
    const createAndFormat = (year: number) => {
      return adapter.getYearName(adapter.createDate(year, JAN, 1));
    };

    expect(createAndFormat(50)).toBe('50');
    expect(createAndFormat(99)).toBe('99');
    expect(createAndFormat(100)).toBe('100');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017年');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should create Date', () => {
    expect(adapter.createDate(2017, JAN, 1)).toEqual(new Date(2017, JAN, 1));
  });

  it('should not create Date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, DEC + 1, 1)).toThrow();
    expect(() => adapter.createDate(2017, JAN - 1, 1)).toThrow();
  });

  it('should not create Date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it('should create Date with low year number', () => {
    expect(adapter.createDate(-1, JAN, 1).getFullYear()).toBe(-1);
    expect(adapter.createDate(0, JAN, 1).getFullYear()).toBe(0);
    expect(adapter.createDate(50, JAN, 1).getFullYear()).toBe(50);
    expect(adapter.createDate(99, JAN, 1).getFullYear()).toBe(99);
    expect(adapter.createDate(100, JAN, 1).getFullYear()).toBe(100);
  });

  it('should format Date with low year number', () => {
    const createAndFormat = (year: number) => {
      return adapter.format(adapter.createDate(year, JAN, 1), {});
    };

    expect(createAndFormat(50)).toBe('1/1/50');
    expect(createAndFormat(99)).toBe('1/1/99');
    expect(createAndFormat(100)).toBe('1/1/100');
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), new Date()))
      .withContext("should be equal to today's date")
      .toBe(true);
  });

  it('should parse string', () => {
    expect(adapter.parse('1/1/2017')).toEqual(new Date(2017, JAN, 1));
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp)).toEqual(new Date(timestamp));
  });

  it('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date)).toEqual(date);
    expect(adapter.parse(date)).not.toBe(date);
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d))
      .withContext('Expected string to have been fed through Date.parse')
      .toBe(true);
    expect(adapter.isValid(d as Date))
      .withContext('Expected to parse as "invalid date" object')
      .toBe(false);
  });

  it('should format', () => {
    expect(adapter.format(new Date(2017, JAN, 1), {})).toEqual('1/1/2017');
  });

  it('should format with custom format', () => {
    expect(
      adapter.format(new Date(2017, JAN, 1), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    ).toEqual('January 1, 2017');
  });

  it('should format with a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.format(new Date(2017, JAN, 1), {})).toEqual('2017/1/1');
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(new Date(NaN), {})).toThrowError(
      /NativeDateAdapter: Cannot format invalid date\./,
    );
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(new Date(2017, JAN, 1), 1)).toEqual(new Date(2018, JAN, 1));
    expect(adapter.addCalendarYears(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, JAN, 1));
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(new Date(2016, FEB, 29), 1)).toEqual(new Date(2017, FEB, 28));
    expect(adapter.addCalendarYears(new Date(2016, FEB, 29), -1)).toEqual(new Date(2015, FEB, 28));
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 1), 1)).toEqual(new Date(2017, FEB, 1));
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, DEC, 1));
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 31), 1)).toEqual(new Date(2017, FEB, 28));
    expect(adapter.addCalendarMonths(new Date(2017, MAR, 31), -1)).toEqual(new Date(2017, FEB, 28));
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(new Date(2017, JAN, 1), 1)).toEqual(new Date(2017, JAN, 2));
    expect(adapter.addCalendarDays(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, DEC, 31));
  });

  it('should clone', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.clone(date)).toEqual(date);
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should preserve time when cloning', () => {
    let date = new Date(2017, JAN, 1, 4, 5, 6);
    expect(adapter.clone(date)).toEqual(date);
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, JAN, 2))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, FEB, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2018, JAN, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, JAN, 1))).toBe(0);
    expect(adapter.compareDate(new Date(2018, JAN, 1), new Date(2017, JAN, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, FEB, 1), new Date(2017, JAN, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 2), new Date(2017, JAN, 1))).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(
      adapter.clampDate(new Date(2017, JAN, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)),
    ).toEqual(new Date(2018, JAN, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(
      adapter.clampDate(new Date(2020, JAN, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)),
    ).toEqual(new Date(2019, JAN, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(
      adapter.clampDate(new Date(2018, FEB, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)),
    ).toEqual(new Date(2018, FEB, 1));
  });

  it('should use UTC for formatting by default', () => {
    expect(adapter.format(new Date(1800, 7, 14), {day: 'numeric'})).toBe('14');
  });

  it('should count today as a valid date instance', () => {
    let d = new Date();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    let d = new Date(NaN);
    expect(adapter.isValid(d)).toBe(false);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count a string as not a date instance', () => {
    let d = '1/1/2017';
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should provide a method to return a valid date or null', () => {
    let d = new Date();
    expect(adapter.getValidDateOrNull(d)).toBe(d);
    expect(adapter.getValidDateOrNull(new Date(NaN))).toBeNull();
    expect(adapter.getValidDateOrNull(null)).toBeNull();
    expect(adapter.getValidDateOrNull(undefined)).toBeNull();
    expect(adapter.getValidDateOrNull('')).toBeNull();
    expect(adapter.getValidDateOrNull(0)).toBeNull();
    expect(adapter.getValidDateOrNull('Wed Jul 28 1993')).toBeNull();
    expect(adapter.getValidDateOrNull('1595204418000')).toBeNull();
  });

  it('should create dates from valid ISO strings', () => {
    assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter.deserialize('2017-01-01'), true);
    assertValidDate(adapter.deserialize('2017-01-01T00:00:00'), true);
    assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter.deserialize('1/1/2017'), false);
    assertValidDate(adapter.deserialize('2017-01-01T'), false);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidDate(adapter.deserialize(new Date()), true);
    assertValidDate(adapter.deserialize(new Date(NaN)), false);
  });

  it('should create an invalid date', () => {
    assertValidDate(adapter.invalid(), false);
  });

  it('should not throw when attempting to format a date with a year less than 1', () => {
    expect(() => adapter.format(new Date(-1, 1, 1), {})).not.toThrow();
  });

  it('should not throw when attempting to format a date with a year greater than 9999', () => {
    expect(() => adapter.format(new Date(10000, 1, 1), {})).not.toThrow();
  });

  it('should get hours', () => {
    expect(adapter.getHours(new Date(2024, JAN, 1, 14))).toBe(14);
  });

  it('should get minutes', () => {
    expect(adapter.getMinutes(new Date(2024, JAN, 1, 14, 53))).toBe(53);
  });

  it('should get seconds', () => {
    expect(adapter.getSeconds(new Date(2024, JAN, 1, 14, 53, 42))).toBe(42);
  });

  it('should set the time of a date', () => {
    const target = new Date(2024, JAN, 1, 0, 0, 0);
    const result = adapter.setTime(target, 14, 53, 42);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(53);
    expect(adapter.getSeconds(result)).toBe(42);
  });

  it('should throw when passing in invalid hours to setTime', () => {
    expect(() => adapter.setTime(adapter.today(), -1, 0, 0)).toThrowError(
      'Invalid hours "-1". Hours value must be between 0 and 23.',
    );
    expect(() => adapter.setTime(adapter.today(), 51, 0, 0)).toThrowError(
      'Invalid hours "51". Hours value must be between 0 and 23.',
    );
  });

  it('should throw when passing in invalid minutes to setTime', () => {
    expect(() => adapter.setTime(adapter.today(), 0, -1, 0)).toThrowError(
      'Invalid minutes "-1". Minutes value must be between 0 and 59.',
    );
    expect(() => adapter.setTime(adapter.today(), 0, 65, 0)).toThrowError(
      'Invalid minutes "65". Minutes value must be between 0 and 59.',
    );
  });

  it('should throw when passing in invalid seconds to setTime', () => {
    expect(() => adapter.setTime(adapter.today(), 0, 0, -1)).toThrowError(
      'Invalid seconds "-1". Seconds value must be between 0 and 59.',
    );
    expect(() => adapter.setTime(adapter.today(), 0, 0, 65)).toThrowError(
      'Invalid seconds "65". Seconds value must be between 0 and 59.',
    );
  });

  it('should parse a 24-hour time string', () => {
    const result = adapter.parseTime('14:52')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a 12-hour time string', () => {
    const result = adapter.parseTime('2:52 PM')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a 12-hour time string with seconds', () => {
    const result = adapter.parseTime('2:52:46 PM')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(46);
  });

  it('should parse a padded 12-hour time string', () => {
    const result = adapter.parseTime('02:52 PM')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a padded time string', () => {
    const result = adapter.parseTime('03:04:05')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(3);
    expect(adapter.getMinutes(result)).toBe(4);
    expect(adapter.getSeconds(result)).toBe(5);
  });

  it('should parse a time string that uses dot as a separator', () => {
    const result = adapter.parseTime('14.52')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a time string with characters around the time', () => {
    const result = adapter.parseTime('14:52 ч.')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a 12-hour time string using a dot separator', () => {
    const result = adapter.parseTime('2.52.46 PM')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(46);
  });

  it('should return an invalid date when parsing invalid time string', () => {
    expect(adapter.isValid(adapter.parseTime('abc')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('123')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('14:52 PM')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('24:05')!)).toBe(false);

    // Firefox is a bit more forgiving of invalid times than other browsers.
    // E.g. these just roll over instead of producing an invalid object.
    if (!platform.FIREFOX) {
      expect(adapter.isValid(adapter.parseTime('00:61:05')!)).toBe(false);
      expect(adapter.isValid(adapter.parseTime('14:52:78')!)).toBe(false);
    }
  });

  it('should return null when parsing unsupported time values', () => {
    expect(adapter.parseTime(321)).toBeNull();
    expect(adapter.parseTime('')).toBeNull();
    expect(adapter.parseTime('    ')).toBeNull();
    expect(adapter.parseTime(true)).toBeNull();
    expect(adapter.parseTime(undefined)).toBeNull();
  });

  it('should compare times', () => {
    const base = [2024, JAN, 1] as const;

    expect(
      adapter.compareTime(new Date(...base, 12, 0, 0), new Date(...base, 13, 0, 0)),
    ).toBeLessThan(0);
    expect(
      adapter.compareTime(new Date(...base, 12, 50, 0), new Date(...base, 12, 51, 0)),
    ).toBeLessThan(0);
    expect(adapter.compareTime(new Date(...base, 1, 2, 3), new Date(...base, 1, 2, 3))).toBe(0);
    expect(
      adapter.compareTime(new Date(...base, 13, 0, 0), new Date(...base, 12, 0, 0)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareTime(new Date(...base, 12, 50, 11), new Date(...base, 12, 50, 10)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareTime(new Date(...base, 13, 0, 0), new Date(...base, 10, 59, 59)),
    ).toBeGreaterThan(0);
  });

  it('should add seconds to a date', () => {
    const amount = 20;
    const initial = new Date(2024, JAN, 1, 12, 34, 56);
    const result = adapter.addSeconds(initial, amount);
    expect(result).not.toBe(initial);
    expect(result.getTime() - initial.getTime()).toBe(amount * 1000);
  });
});

describe('NativeDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: NativeDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NativeDateModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'da-DK'}],
    });

    adapter = TestBed.inject(DateAdapter) as NativeDateAdapter;
  });

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    const expectedValue = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    expect(adapter.getDayOfWeekNames('long')).toEqual(expectedValue);
  });
});

describe('NativeDateAdapter with LOCALE_ID override', () => {
  let adapter: NativeDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NativeDateModule],
      providers: [{provide: LOCALE_ID, useValue: 'da-DK'}],
    });

    adapter = TestBed.inject(DateAdapter) as NativeDateAdapter;
  });

  it('should cascade locale id from the LOCALE_ID injection token to MAT_DATE_LOCALE', () => {
    const expectedValue = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    expect(adapter.getDayOfWeekNames('long')).toEqual(expectedValue);
  });
});
