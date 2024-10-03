/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {Locale} from 'date-fns';
import {ja, enUS, da, de, fi} from 'date-fns/locale';
import {DateFnsModule} from './index';

const JAN = 0,
  FEB = 1,
  MAR = 2,
  DEC = 11;

describe('DateFnsAdapter', () => {
  let adapter: DateAdapter<Date, Locale>;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [DateFnsModule]});
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale(enUS);
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
    adapter.setLocale(da);

    expect(adapter.getMonthNames('long')).toEqual([
      'januar',
      'februar',
      'marts',
      'april',
      'maj',
      'juni',
      'juli',
      'august',
      'september',
      'oktober',
      'november',
      'december',
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
    adapter.setLocale(ja);
    if (typeof Intl !== 'undefined') {
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
    } else {
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
    }
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
    adapter.setLocale(ja);

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

  it('should get year name in a different locale', () => {
    adapter.setLocale(ja);
    expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should not create Date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, 12, 1)).toThrow();
    expect(() => adapter.createDate(2017, -1, 1)).toThrow();
  });

  it('should not create Date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), new Date()))
      .withContext("should be equal to today's date")
      .toBe(true);
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'M/d/yyyy')).toEqual(new Date(2017, JAN, 2));
    expect(adapter.parse('1/2/2017', 'd/M/yyyy')).toEqual(new Date(2017, FEB, 1));
  });

  it('should parse string according to first matching format', () => {
    expect(adapter.parse('1/2/2017', ['M/d/yyyy', 'yyyy/d/M'])).toEqual(new Date(2017, JAN, 2));
    expect(adapter.parse('1/2/2017', ['yyyy/d/M', 'M/d/yyyy'])).toEqual(new Date(2017, JAN, 2));
  });

  it('should throw if parse formats are an empty array', () => {
    expect(() => adapter.parse('1/2/2017', [])).toThrowError('Formats array must not be empty.');
  });

  it('should parse number', () => {
    const timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'MM/dd/yyyy')!.getTime()).toEqual(timestamp);
  });

  it('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'MM/dd/yyyy')).toEqual(date);
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'MM/dd/yyyy')).toBeNull();
  });

  it('should parse based on the specified locale', () => {
    adapter.setLocale(de);
    expect(adapter.parse('02.01.2017', 'P')).toEqual(new Date(2017, JAN, 2));
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello', 'MM/dd/yyyy');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d)).toBe(true);
    expect(adapter.isValid(d as Date))
      .withContext('Expected to parse as "invalid date" object')
      .toBe(false);
  });

  it('should format date according to given format', () => {
    expect(adapter.format(new Date(2017, JAN, 2), 'MM/dd/yyyy')).toEqual('01/02/2017');
  });

  it('should format with a different locale', () => {
    let date = adapter.format(new Date(2017, JAN, 2), 'PP');

    expect(stripDirectionalityCharacters(date)).toEqual('Jan 2, 2017');
    adapter.setLocale(da);

    date = adapter.format(new Date(2017, JAN, 2), 'PP');
    expect(stripDirectionalityCharacters(date)).toEqual('2. jan. 2017');
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(new Date(NaN), 'MM/dd/yyyy')).toThrowError(
      /DateFnsAdapter: Cannot format invalid date\./,
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
    let clone = adapter.clone(date);

    expect(clone).not.toBe(date);
    expect(clone.getTime()).toEqual(date.getTime());
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

  it('should create valid dates from valid ISO strings', () => {
    assertValidDate(adapter, adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter, adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter, adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter, adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter, adapter.deserialize('1/1/2017'), false);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidDate(adapter, adapter.deserialize(new Date()), true);
    assertValidDate(adapter, adapter.deserialize(new Date(NaN)), false);
    assertValidDate(adapter, adapter.deserialize(new Date()), true);
    assertValidDate(adapter, adapter.deserialize(new Date('Not valid')), false);
  });

  it('should create invalid date', () => {
    assertValidDate(adapter, adapter.invalid(), false);
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
    adapter.setLocale(da);
    const result = adapter.parseTime('14:52', 'p')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a 12-hour time string', () => {
    const result = adapter.parseTime('2:52 PM', 'p')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should parse a padded time string', () => {
    const result = adapter.parseTime('03:04:05 AM', 'pp')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(3);
    expect(adapter.getMinutes(result)).toBe(4);
    expect(adapter.getSeconds(result)).toBe(5);
  });

  it('should parse a time string that uses dot as a separator', () => {
    adapter.setLocale(fi);
    const result = adapter.parseTime('14.52', 'p')!;
    expect(result).toBeTruthy();
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getHours(result)).toBe(14);
    expect(adapter.getMinutes(result)).toBe(52);
    expect(adapter.getSeconds(result)).toBe(0);
  });

  it('should return an invalid date when parsing invalid time string', () => {
    expect(adapter.isValid(adapter.parseTime('abc', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('123', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('    ', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime(true, 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime(undefined, 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('14:52 PM', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('24:05', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('00:61:05', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('14:52:78', 'p')!)).toBe(false);
    expect(adapter.isValid(adapter.parseTime('12:10 PM11:10 PM', 'p')!)).toBe(false);
  });

  it('should compare times', () => {
    // Use different dates to guarantee that we only compare the times.
    const aDate = [2024, JAN, 1] as const;
    const bDate = [2024, FEB, 7] as const;

    expect(
      adapter.compareTime(new Date(...aDate, 12, 0, 0), new Date(...bDate, 13, 0, 0)),
    ).toBeLessThan(0);
    expect(
      adapter.compareTime(new Date(...aDate, 12, 50, 0), new Date(...bDate, 12, 51, 0)),
    ).toBeLessThan(0);
    expect(adapter.compareTime(new Date(...aDate, 1, 2, 3), new Date(...bDate, 1, 2, 3))).toBe(0);
    expect(
      adapter.compareTime(new Date(...aDate, 13, 0, 0), new Date(...bDate, 12, 0, 0)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareTime(new Date(...aDate, 12, 50, 11), new Date(...bDate, 12, 50, 10)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareTime(new Date(...aDate, 13, 0, 0), new Date(...bDate, 10, 59, 59)),
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

describe('DateFnsAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: DateAdapter<Date, Locale>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DateFnsModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: da}],
    });

    adapter = TestBed.inject(DateAdapter);
  });

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    const date = adapter.format(new Date(2017, JAN, 2), 'PP');
    expect(stripDirectionalityCharacters(date)).toEqual('2. jan. 2017');
  });
});

function stripDirectionalityCharacters(str: string) {
  return str.replace(/[\u200e\u200f]/g, '');
}

function assertValidDate(adapter: DateAdapter<Date, Locale>, d: Date | null, valid: boolean) {
  expect(adapter.isDateInstance(d))
    .not.withContext(`Expected ${d} to be a date instance`)
    .toBeNull();
  expect(adapter.isValid(d!))
    .withContext(
      `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
        ` but was ${valid ? 'invalid' : 'valid'}`,
    )
    .toBe(valid);
}
