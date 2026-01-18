/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
  TemporalDateAdapter,
  TemporalDateType,
  TemporalModule,
} from './index';

const JAN = 0,
  FEB = 1,
  MAR = 2,
  APR = 3,
  MAY = 4,
  JUN = 5,
  JUL = 6,
  AUG = 7,
  SEP = 8,
  OCT = 9,
  NOV = 10,
  DEC = 11;

const hasTemporal = typeof (globalThis as {Temporal?: unknown}).Temporal !== 'undefined';
const describe: (description: string, specDefinitions: () => void) => void = hasTemporal
  ? (globalThis as any).describe
  : (globalThis as any).xdescribe;
const supportsCalendar = (calendarId: string): boolean => {
  if (!hasTemporal) {
    return false;
  }

  try {
    Temporal.PlainDate.from({year: 2024, month: 1, day: 1, calendar: calendarId});
    return true;
  } catch {
    return false;
  }
};
const describeIfCalendarSupported = (calendarId: string) =>
  supportsCalendar(calendarId) ? describe : xdescribe;

describe('TemporalDateAdapter', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TemporalModule]});
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
  });

  it('should get year', () => {
    expect(adapter.getYear(adapter.createDate(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(adapter.createDate(2017, JAN, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(adapter.createDate(2017, JAN, 1))).toBe(1);
  });

  it('should get day of week', () => {
    // January 1, 2017 was a Sunday
    expect(adapter.getDayOfWeek(adapter.createDate(2017, JAN, 1))).toBe(0);
    // January 2, 2017 was a Monday
    expect(adapter.getDayOfWeek(adapter.createDate(2017, JAN, 2))).toBe(1);
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

  it('should get year name', () => {
    expect(adapter.getYearName(adapter.createDate(2017, JAN, 1))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBeGreaterThanOrEqual(0);
    expect(adapter.getFirstDayOfWeek()).toBeLessThanOrEqual(6);
  });

  it('should get number of days in month', () => {
    expect(adapter.getNumDaysInMonth(adapter.createDate(2017, JAN, 1))).toBe(31);
    expect(adapter.getNumDaysInMonth(adapter.createDate(2017, FEB, 1))).toBe(28);
    expect(adapter.getNumDaysInMonth(adapter.createDate(2016, FEB, 1))).toBe(29); // Leap year
    expect(adapter.getNumDaysInMonth(adapter.createDate(2017, APR, 1))).toBe(30);
  });

  it('should clone', () => {
    const date = adapter.createDate(2017, JAN, 1);
    const clone = adapter.clone(date);

    expect(clone).not.toBe(date);
    expect(adapter.getYear(clone)).toEqual(adapter.getYear(date));
    expect(adapter.getMonth(clone)).toEqual(adapter.getMonth(date));
    expect(adapter.getDate(clone)).toEqual(adapter.getDate(date));
  });

  it('should create date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    expect(adapter.getYear(date)).toBe(2017);
    expect(adapter.getMonth(date)).toBe(JAN);
    expect(adapter.getDate(date)).toBe(1);
  });

  it('should not create date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, 12, 1)).toThrow();
    expect(() => adapter.createDate(2017, -1, 1)).toThrow();
  });

  it('should not create date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it('should create date with low year number', () => {
    expect(adapter.getYear(adapter.createDate(-1, JAN, 1))).toBe(-1);
    expect(adapter.getYear(adapter.createDate(0, JAN, 1))).toBe(0);
    expect(adapter.getYear(adapter.createDate(50, JAN, 1))).toBe(50);
    expect(adapter.getYear(adapter.createDate(99, JAN, 1))).toBe(99);
    expect(adapter.getYear(adapter.createDate(100, JAN, 1))).toBe(100);
  });

  it('should create today', () => {
    const today = adapter.today();
    const jsToday = new Date();
    expect(adapter.getYear(today)).toBe(jsToday.getFullYear());
    expect(adapter.getMonth(today)).toBe(jsToday.getMonth());
    expect(adapter.getDate(today)).toBe(jsToday.getDate());
  });

  it('should parse ISO 8601 date string', () => {
    const date = adapter.parse('2017-01-02', null);
    expect(date).not.toBeNull();
    expect(adapter.getYear(date!)).toBe(2017);
    expect(adapter.getMonth(date!)).toBe(JAN);
    expect(adapter.getDate(date!)).toBe(2);
  });

  it('should parse number', () => {
    const timestamp = new Date(2017, JAN, 1).getTime();
    const date = adapter.parse(timestamp, null);
    expect(date).not.toBeNull();
    expect(adapter.getYear(date!)).toBe(2017);
    expect(adapter.getMonth(date!)).toBe(JAN);
    expect(adapter.getDate(date!)).toBe(1);
  });

  it('should return invalid for JS Date (not supported)', () => {
    const jsDate = new Date(2017, JAN, 1);
    const date = adapter.parse(jsDate, null);
    // Temporal adapter doesn't accept JS Date - use Temporal types instead
    expect(adapter.isValid(date!)).toBe(false);
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', null)).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    const d = adapter.parse('hello', null);
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d)).toBe(true);
    expect(adapter.isValid(d as TemporalDateType)).toBe(false);
  });

  it('should parse Temporal date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    const parsedDate = adapter.parse(date, null);
    expect(parsedDate).not.toBeNull();
    expect(adapter.getYear(parsedDate!)).toBe(2017);
    expect(adapter.getMonth(parsedDate!)).toBe(JAN);
    expect(adapter.getDate(parsedDate!)).toBe(1);
    expect(parsedDate).not.toBe(date);
  });

  it('should format date', () => {
    const date = adapter.createDate(2017, JAN, 2);
    const formatted = adapter.format(date, {year: 'numeric', month: '2-digit', day: '2-digit'});
    expect(formatted).toBeTruthy();
    // Format may vary by locale, just check it contains the right components
    expect(formatted).toContain('2017');
    expect(formatted).toContain('01');
    expect(formatted).toContain('02');
  });

  it('should throw when formatting invalid date', () => {
    expect(() => adapter.format(adapter.invalid(), {year: 'numeric'})).toThrowError(
      /Cannot format invalid date/,
    );
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(adapter.createDate(2017, JAN, 1), 1)).toEqual(
      adapter.createDate(2018, JAN, 1),
    );
    expect(adapter.addCalendarYears(adapter.createDate(2017, JAN, 1), -1)).toEqual(
      adapter.createDate(2016, JAN, 1),
    );
  });

  it('should respect leap years when adding years', () => {
    const feb29 = adapter.createDate(2016, FEB, 29);
    const addedYear = adapter.addCalendarYears(feb29, 1);
    expect(adapter.getYear(addedYear)).toBe(2017);
    expect(adapter.getMonth(addedYear)).toBe(FEB);
    expect(adapter.getDate(addedYear)).toBe(28);
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(adapter.createDate(2017, JAN, 1), 1)).toEqual(
      adapter.createDate(2017, FEB, 1),
    );
    expect(adapter.addCalendarMonths(adapter.createDate(2017, JAN, 1), -1)).toEqual(
      adapter.createDate(2016, DEC, 1),
    );
  });

  it('should respect month length differences when adding months', () => {
    const jan31 = adapter.createDate(2017, JAN, 31);
    const addedMonth = adapter.addCalendarMonths(jan31, 1);
    expect(adapter.getYear(addedMonth)).toBe(2017);
    expect(adapter.getMonth(addedMonth)).toBe(FEB);
    expect(adapter.getDate(addedMonth)).toBe(28);
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(adapter.createDate(2017, JAN, 1), 1)).toEqual(
      adapter.createDate(2017, JAN, 2),
    );
    expect(adapter.addCalendarDays(adapter.createDate(2017, JAN, 1), -1)).toEqual(
      adapter.createDate(2016, DEC, 31),
    );
  });

  it('should produce ISO 8601 string', () => {
    const date = adapter.createDate(2017, JAN, 2);
    expect(adapter.toIso8601(date)).toBe('2017-01-02');
  });

  it('should create valid dates from valid ISO strings', () => {
    assertValidDate(adapter, adapter.deserialize('1985-04-12'), true);
    assertValidDate(adapter, adapter.deserialize('2017-01-01'), true);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    // Temporal adapter doesn't accept JS Date - test that it returns invalid
    assertValidDate(adapter, adapter.deserialize(new Date(2017, JAN, 1)), false);
    assertValidDate(adapter, adapter.deserialize(new Date(NaN)), false);
  });

  it('should create invalid date', () => {
    assertValidDate(adapter, adapter.invalid(), false);
  });

  it('should count today as a valid date instance', () => {
    const d = adapter.today();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    const d = adapter.invalid();
    expect(adapter.isValid(d)).toBe(false);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count a string as not a date instance', () => {
    const d = '1/1/2017';
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should count a Date as not a date instance', () => {
    const d = new Date();
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should return the date when deserializing a Temporal date', () => {
    // Temporal types are immutable, so returning the same instance is safe
    const date = adapter.createDate(2017, JAN, 1);
    const deserialized = adapter.deserialize(date);
    expect(deserialized).not.toBeNull();
    expect(adapter.getYear(deserialized!)).toBe(2017);
    // Immutable objects don't need to be cloned
    expect(deserialized).toBe(date);
  });

  it('should provide a method to return a valid date or null', () => {
    const d = adapter.today();
    expect(adapter.getValidDateOrNull(d)).toBe(d);
    expect(adapter.getValidDateOrNull(adapter.invalid())).toBeNull();
  });

  it('should compare dates', () => {
    expect(
      adapter.compareDate(adapter.createDate(2017, JAN, 1), adapter.createDate(2017, JAN, 2)),
    ).toBeLessThan(0);
    expect(
      adapter.compareDate(adapter.createDate(2017, JAN, 1), adapter.createDate(2017, FEB, 1)),
    ).toBeLessThan(0);
    expect(
      adapter.compareDate(adapter.createDate(2017, JAN, 1), adapter.createDate(2018, JAN, 1)),
    ).toBeLessThan(0);
    expect(
      adapter.compareDate(adapter.createDate(2017, JAN, 1), adapter.createDate(2017, JAN, 1)),
    ).toBe(0);
    expect(
      adapter.compareDate(adapter.createDate(2018, JAN, 1), adapter.createDate(2017, JAN, 1)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareDate(adapter.createDate(2017, FEB, 1), adapter.createDate(2017, JAN, 1)),
    ).toBeGreaterThan(0);
    expect(
      adapter.compareDate(adapter.createDate(2017, JAN, 2), adapter.createDate(2017, JAN, 1)),
    ).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(
      adapter.clampDate(
        adapter.createDate(2017, JAN, 1),
        adapter.createDate(2018, JAN, 1),
        adapter.createDate(2019, JAN, 1),
      ),
    ).toEqual(adapter.createDate(2018, JAN, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(
      adapter.clampDate(
        adapter.createDate(2020, JAN, 1),
        adapter.createDate(2018, JAN, 1),
        adapter.createDate(2019, JAN, 1),
      ),
    ).toEqual(adapter.createDate(2019, JAN, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(
      adapter.clampDate(
        adapter.createDate(2018, FEB, 1),
        adapter.createDate(2018, JAN, 1),
        adapter.createDate(2019, JAN, 1),
      ),
    ).toEqual(adapter.createDate(2018, FEB, 1));
  });
});

describe('TemporalDateAdapter with datetime mode', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'datetime'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('en-US');
  });

  it('should get hours', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
  });

  it('should get minutes', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getMinutes(withTime)).toBe(30);
  });

  it('should get seconds', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should set time', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
    expect(adapter.getMinutes(withTime)).toBe(30);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should throw when passing invalid hours to setTime', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, -1, 0, 0)).toThrowError(/Invalid hours/);
    expect(() => adapter.setTime(date, 24, 0, 0)).toThrowError(/Invalid hours/);
  });

  it('should throw when passing invalid minutes to setTime', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, 0, -1, 0)).toThrowError(/Invalid minutes/);
    expect(() => adapter.setTime(date, 0, 60, 0)).toThrowError(/Invalid minutes/);
  });

  it('should throw when passing invalid seconds to setTime', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, 0, 0, -1)).toThrowError(/Invalid seconds/);
    expect(() => adapter.setTime(date, 0, 0, 60)).toThrowError(/Invalid seconds/);
  });

  it('should parse time string', () => {
    const result = adapter.parseTime('14:30', 'HH:mm');
    expect(result).not.toBeNull();
    expect(adapter.getHours(result!)).toBe(14);
    expect(adapter.getMinutes(result!)).toBe(30);
  });

  it('should parse 12-hour time string with AM/PM', () => {
    const result = adapter.parseTime('2:30 PM', 'h:mm a');
    expect(result).not.toBeNull();
    expect(adapter.getHours(result!)).toBe(14);
    expect(adapter.getMinutes(result!)).toBe(30);
  });

  it('should parse padded time string', () => {
    const result = adapter.parseTime('03:04:05', 'HH:mm:ss');
    expect(result).not.toBeNull();
    expect(adapter.isValid(result!)).toBe(true);
    expect(adapter.getHours(result!)).toBe(3);
    expect(adapter.getMinutes(result!)).toBe(4);
    expect(adapter.getSeconds(result!)).toBe(5);
  });

  it('should return invalid date when parsing invalid time string', () => {
    const abc = adapter.parseTime('abc', 'HH:mm');
    expect(abc).not.toBeNull();
    expect(adapter.isValid(abc!)).toBe(false);

    const spaces = adapter.parseTime('    ', 'HH:mm');
    expect(spaces).not.toBeNull();
    expect(adapter.isValid(spaces!)).toBe(false);
  });

  it('should return invalid date when parsing out-of-range time values', () => {
    const invalidHours = adapter.parseTime('24:05', 'HH:mm');
    expect(invalidHours).not.toBeNull();
    expect(adapter.isValid(invalidHours!)).toBe(false);

    const invalidMinutes = adapter.parseTime('00:61', 'HH:mm');
    expect(invalidMinutes).not.toBeNull();
    expect(adapter.isValid(invalidMinutes!)).toBe(false);

    const invalidSeconds = adapter.parseTime('14:52:78', 'HH:mm:ss');
    expect(invalidSeconds).not.toBeNull();
    expect(adapter.isValid(invalidSeconds!)).toBe(false);
  });

  it('should return null when parsing empty or undefined time values', () => {
    expect(adapter.parseTime(undefined, 'HH:mm')).toBeNull();
    expect(adapter.parseTime('', 'HH:mm')).toBeNull();
  });

  it('should add seconds', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 12, 30, 0);
    const result = adapter.addSeconds(withTime, 90);
    expect(adapter.getMinutes(result)).toBe(31);
    expect(adapter.getSeconds(result)).toBe(30);
  });

  it('should preserve time when cloning', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 45);
    const clone = adapter.clone(withTime);
    expect(adapter.getHours(clone)).toBe(14);
    expect(adapter.getMinutes(clone)).toBe(30);
    expect(adapter.getSeconds(clone)).toBe(45);
  });
});

describeIfCalendarSupported('hebrew')('TemporalDateAdapter with custom calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'hebrew', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('he-IL');
  });

  it('should create date with Hebrew calendar', () => {
    const date = adapter.createDate(5784, 0, 1); // First month of Hebrew year 5784
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get correct number of months for Hebrew calendar', () => {
    // Hebrew calendar can have 12 or 13 months depending on leap year
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBeGreaterThanOrEqual(12);
  });
});

describe('TemporalDateAdapter with firstDayOfWeek option', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'date', firstDayOfWeek: 1},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should use custom first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(1); // Monday
  });
});

describeIfCalendarSupported('islamic')('TemporalDateAdapter with Islamic calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'islamic', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('ar-SA');
  });

  it('should create date with Islamic calendar', () => {
    const date = adapter.createDate(1445, 0, 1); // First month of Islamic year 1445
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get month names for Islamic calendar', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBe(12);
    // First month of Islamic calendar is Muharram
    expect(monthNames[0]).toBeTruthy();
  });
});

describeIfCalendarSupported('japanese')('TemporalDateAdapter with Japanese calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'japanese', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('ja-JP');
  });

  it('should create date with Japanese calendar', () => {
    // Reiwa 6 = 2024 in Gregorian
    const date = adapter.createDate(2024, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get year name in Japanese era format', () => {
    const date = adapter.createDate(2024, 0, 1);
    const yearName = adapter.getYearName(date);
    // Should contain Japanese era or year
    expect(yearName).toBeTruthy();
  });
});

describe('TemporalDateAdapter with Arabic locale', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('ar-EG');
  });

  it('should get date names in Arabic numerals', () => {
    const dateNames = adapter.getDateNames();
    // Arabic numerals for 1: ١
    expect(dateNames[0]).toBe('١');
  });

  it('should format date with Arabic numerals', () => {
    const date = adapter.createDate(2024, 0, 15);
    const formatted = adapter.format(date, {day: 'numeric'});
    // Should contain Arabic numeral for 15: ١٥
    expect(formatted).toBe('١٥');
  });
});

describe('TemporalDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'de-DE'}],
    });

    adapter = TestBed.inject(DateAdapter);
  });

  it('should take the default locale from MAT_DATE_LOCALE', () => {
    const date = adapter.createDate(2017, JAN, 2);
    const formatted = adapter.format(date, {year: 'numeric', month: 'long', day: 'numeric'});
    // German format should include "Januar"
    expect(formatted.toLowerCase()).toContain('januar');
  });

  it('should get month names in German', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames[0].toLowerCase()).toContain('januar');
    expect(monthNames[1].toLowerCase()).toContain('februar');
  });
});

function assertValidDate(
  adapter: DateAdapter<TemporalDateType>,
  d: TemporalDateType | null,
  valid: boolean,
) {
  expect(adapter.isDateInstance(d))
    .withContext(`Expected ${d} to be a date instance`)
    .not.toBeNull();
  expect(adapter.isValid(d!))
    .withContext(
      `Expected ${d} to be ${valid ? 'valid' : 'invalid'}, but was ${valid ? 'invalid' : 'valid'}`,
    )
    .toBe(valid);
}

describeIfCalendarSupported('chinese')('TemporalDateAdapter with Chinese calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'chinese', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('zh-CN');
  });

  it('should create date with Chinese calendar', () => {
    const date = adapter.createDate(2024, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get month names for Chinese calendar', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBeGreaterThanOrEqual(12);
  });
});

describeIfCalendarSupported('persian')('TemporalDateAdapter with Persian calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'persian', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('fa-IR');
  });

  it('should create date with Persian calendar', () => {
    // Persian year 1403 = 2024 in Gregorian
    const date = adapter.createDate(1403, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get month names for Persian calendar', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBe(12);
  });
});

describeIfCalendarSupported('buddhist')('TemporalDateAdapter with Buddhist calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'buddhist', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('th-TH');
  });

  it('should create date with Buddhist calendar', () => {
    // Buddhist year 2567 = 2024 in Gregorian
    const date = adapter.createDate(2567, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });
});

describeIfCalendarSupported('indian')('TemporalDateAdapter with Indian calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'indian', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('hi-IN');
  });

  it('should create date with Indian calendar', () => {
    const date = adapter.createDate(1946, 0, 1); // Indian National Calendar
    expect(adapter.isValid(date)).toBe(true);
  });
});

describeIfCalendarSupported('ethiopic')('TemporalDateAdapter with Ethiopian calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'ethiopic', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('am-ET');
  });

  it('should create date with Ethiopian calendar', () => {
    // Ethiopian year 2016 = 2024 in Gregorian
    const date = adapter.createDate(2016, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });
});

describeIfCalendarSupported('coptic')('TemporalDateAdapter with Coptic calendar', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'coptic', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('cop');
  });

  it('should create date with Coptic calendar', () => {
    // Coptic year 1740 = 2024 in Gregorian
    const date = adapter.createDate(1740, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });
});

describe('TemporalDateAdapter with zoned mode (UTC)', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', timezone: 'UTC'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should create ZonedDateTime in UTC timezone', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
    expect((date as unknown as {timeZoneId: string}).timeZoneId).toBe('UTC');
  });

  it('should get year from ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.getYear(date)).toBe(2024);
  });

  it('should get month from ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.getMonth(date)).toBe(0); // January = 0
  });

  it('should get date from ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.getDate(date)).toBe(15);
  });

  it('should format ZonedDateTime correctly', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const formatted = adapter.format(date, {year: 'numeric', month: '2-digit', day: '2-digit'});
    expect(formatted).toContain('2024');
  });

  it('should clone ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const cloned = adapter.clone(date);
    expect(adapter.sameDate(date, cloned)).toBe(true);
  });

  it('should add calendar days to ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarDays(date, 10);
    expect(adapter.getDate(result)).toBe(25);
  });

  it('should add calendar months to ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarMonths(date, 1);
    expect(adapter.getMonth(result)).toBe(1); // February
  });

  it('should add calendar years to ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarYears(date, 1);
    expect(adapter.getYear(result)).toBe(2025);
  });

  it('should set time on ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
    expect(adapter.getMinutes(withTime)).toBe(30);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should add seconds to ZonedDateTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 12, 30, 0);
    const result = adapter.addSeconds(withTime, 90);
    expect(adapter.getMinutes(result)).toBe(31);
    expect(adapter.getSeconds(result)).toBe(30);
  });

  it('should parse epoch milliseconds in zoned mode', () => {
    // Create a known UTC timestamp: 2024-01-15T12:00:00Z
    const epochMs = Date.UTC(2024, 0, 15, 12, 0, 0);
    const date = adapter.parse(epochMs, null);
    expect(date).not.toBeNull();
    expect(adapter.isValid(date!)).toBe(true);
    expect(adapter.getYear(date!)).toBe(2024);
    expect(adapter.getMonth(date!)).toBe(0);
    expect(adapter.getDate(date!)).toBe(15);
  });

  it('should deserialize ISO string in zoned mode', () => {
    // ISO string with time will be parsed as ZonedDateTime
    const date = adapter.deserialize('2024-01-15');
    expect(date).not.toBeNull();
    expect(adapter.isValid(date!)).toBe(true);
    expect(adapter.getYear(date!)).toBe(2024);
  });
});

describe('TemporalDateAdapter with zoned mode (specific timezone)', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', timezone: 'America/New_York'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should create ZonedDateTime in New York timezone', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
    expect((date as unknown as {timeZoneId: string}).timeZoneId).toBe('America/New_York');
  });

  it('should get today in New York timezone', () => {
    const today = adapter.today();
    expect(adapter.isValid(today)).toBe(true);
    expect((today as unknown as {timeZoneId: string}).timeZoneId).toBe('America/New_York');
  });
});

describe('TemporalDateAdapter edge cases', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [TemporalModule]});
    adapter = TestBed.inject(DateAdapter);
  });

  it('should handle leap year February', () => {
    // 2024 is a leap year
    const leapYearFeb29 = adapter.createDate(2024, FEB, 29);
    expect(adapter.isValid(leapYearFeb29)).toBe(true);
    expect(adapter.getDate(leapYearFeb29)).toBe(29);
  });

  it('should throw for invalid date in non-leap year', () => {
    // 2023 is not a leap year
    expect(() => adapter.createDate(2023, FEB, 29)).toThrowError(/Invalid date/);
  });

  it('should handle month boundaries correctly', () => {
    // January has 31 days
    const jan31 = adapter.createDate(2024, JAN, 31);
    expect(adapter.getDate(jan31)).toBe(31);

    // April has 30 days
    const apr30 = adapter.createDate(2024, APR, 30);
    expect(adapter.getDate(apr30)).toBe(30);
  });

  it('should throw for day 0', () => {
    expect(() => adapter.createDate(2024, JAN, 0)).toThrowError(/Invalid date/);
  });

  it('should throw for negative day', () => {
    expect(() => adapter.createDate(2024, JAN, -1)).toThrowError(/Invalid date/);
  });

  it('should throw for invalid month', () => {
    expect(() => adapter.createDate(2024, 12, 1)).toThrowError(/Invalid month/);
    expect(() => adapter.createDate(2024, -1, 1)).toThrowError(/Invalid month/);
  });

  it('should handle year 0 (1 BCE)', () => {
    const year0 = adapter.createDate(0, JAN, 1);
    expect(adapter.isValid(year0)).toBe(true);
    expect(adapter.getYear(year0)).toBe(0);
  });

  it('should handle negative years (BCE)', () => {
    const bce = adapter.createDate(-100, JAN, 1);
    expect(adapter.isValid(bce)).toBe(true);
    expect(adapter.getYear(bce)).toBe(-100);
  });

  it('should handle far future dates', () => {
    const farFuture = adapter.createDate(9999, DEC, 31);
    expect(adapter.isValid(farFuture)).toBe(true);
    expect(adapter.getYear(farFuture)).toBe(9999);
  });

  it('should compare dates correctly', () => {
    const earlier = adapter.createDate(2024, JAN, 1);
    const later = adapter.createDate(2024, JAN, 2);
    const same = adapter.createDate(2024, JAN, 1);

    expect(adapter.compareDate(earlier, later)).toBeLessThan(0);
    expect(adapter.compareDate(later, earlier)).toBeGreaterThan(0);
    expect(adapter.compareDate(earlier, same)).toBe(0);
  });

  it('should correctly identify same day', () => {
    const date1 = adapter.createDate(2024, JAN, 15);
    const date2 = adapter.createDate(2024, JAN, 15);
    const date3 = adapter.createDate(2024, JAN, 16);

    expect(adapter.sameDate(date1, date2)).toBe(true);
    expect(adapter.sameDate(date1, date3)).toBe(false);
  });

  it('should clamp date within range', () => {
    const min = adapter.createDate(2024, JAN, 5);
    const max = adapter.createDate(2024, JAN, 25);
    const tooEarly = adapter.createDate(2024, JAN, 1);
    const tooLate = adapter.createDate(2024, JAN, 30);
    const inRange = adapter.createDate(2024, JAN, 15);

    expect(adapter.clampDate(tooEarly, min, max)).toEqual(min);
    expect(adapter.clampDate(tooLate, min, max)).toEqual(max);
    expect(adapter.clampDate(inRange, min, max)).toEqual(inRange);
  });

  it('should handle parsing ISO 8601 date format', () => {
    // ISO format (the only format Temporal natively supports)
    const iso = adapter.parse('2024-01-15', null);
    expect(adapter.isValid(iso!)).toBe(true);
    expect(adapter.getYear(iso!)).toBe(2024);
    expect(adapter.getMonth(iso!)).toBe(JAN);
    expect(adapter.getDate(iso!)).toBe(15);
  });

  it('should return invalid for non-ISO date formats', () => {
    // US format - not supported (like NativeDateAdapter with Date.parse)
    const us = adapter.parse('01/15/2024', null);
    expect(adapter.isValid(us!)).toBe(false);

    // European format - not supported
    const eu = adapter.parse('15.01.2024', null);
    expect(adapter.isValid(eu!)).toBe(false);
  });

  it('should return null for null/undefined parse input', () => {
    expect(adapter.parse(null, null)).toBeNull();
    expect(adapter.parse(undefined, null)).toBeNull();
  });

  it('should return invalid for unparseable string', () => {
    const result = adapter.parse('not-a-date', null);
    expect(adapter.isValid(result!)).toBe(false);
  });

  it('should handle month rollover when adding months', () => {
    // January 31 + 1 month should be February 28/29
    const jan31 = adapter.createDate(2024, JAN, 31);
    const feb = adapter.addCalendarMonths(jan31, 1);
    expect(adapter.getMonth(feb)).toBe(1); // February
    expect(adapter.getDate(feb)).toBe(29); // 2024 is leap year
  });

  it('should handle year rollover when adding months', () => {
    const dec = adapter.createDate(2024, DEC, 15);
    const jan = adapter.addCalendarMonths(dec, 1);
    expect(adapter.getYear(jan)).toBe(2025);
    expect(adapter.getMonth(jan)).toBe(0);
  });

  it('should handle day subtraction across month boundary', () => {
    const jan1 = adapter.createDate(2024, JAN, 1);
    const prevDay = adapter.addCalendarDays(jan1, -1);
    expect(adapter.getYear(prevDay)).toBe(2023);
    expect(adapter.getMonth(prevDay)).toBe(11); // December
    expect(adapter.getDate(prevDay)).toBe(31);
  });
});

describe('TemporalDateAdapter time edge cases', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'datetime'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should handle midnight correctly', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const midnight = adapter.setTime(date, 0, 0, 0);
    expect(adapter.getHours(midnight)).toBe(0);
    expect(adapter.getMinutes(midnight)).toBe(0);
    expect(adapter.getSeconds(midnight)).toBe(0);
  });

  it('should handle end of day correctly', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const endOfDay = adapter.setTime(date, 23, 59, 59);
    expect(adapter.getHours(endOfDay)).toBe(23);
    expect(adapter.getMinutes(endOfDay)).toBe(59);
    expect(adapter.getSeconds(endOfDay)).toBe(59);
  });

  it('should throw for invalid hours', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(() => adapter.setTime(date, 24, 0, 0)).toThrowError(/Invalid hours/);
    expect(() => adapter.setTime(date, -1, 0, 0)).toThrowError(/Invalid hours/);
  });

  it('should throw for invalid minutes', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(() => adapter.setTime(date, 12, 60, 0)).toThrowError(/Invalid minutes/);
    expect(() => adapter.setTime(date, 12, -1, 0)).toThrowError(/Invalid minutes/);
  });

  it('should throw for invalid seconds', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(() => adapter.setTime(date, 12, 30, 60)).toThrowError(/Invalid seconds/);
    expect(() => adapter.setTime(date, 12, 30, -1)).toThrowError(/Invalid seconds/);
  });

  it('should parse 12-hour time with AM/PM', () => {
    const am = adapter.parseTime('9:30 AM', 'h:mm a');
    expect(adapter.getHours(am!)).toBe(9);

    const pm = adapter.parseTime('9:30 PM', 'h:mm a');
    expect(adapter.getHours(pm!)).toBe(21);
  });

  it('should parse 12:00 AM as midnight', () => {
    const midnight = adapter.parseTime('12:00 AM', 'h:mm a');
    expect(adapter.getHours(midnight!)).toBe(0);
  });

  it('should parse 12:00 PM as noon', () => {
    const noon = adapter.parseTime('12:00 PM', 'h:mm a');
    expect(adapter.getHours(noon!)).toBe(12);
  });

  it('should handle seconds overflow in addSeconds', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 23, 59, 30);
    const result = adapter.addSeconds(withTime, 60);

    // Should roll over to next day
    expect(adapter.getDate(result)).toBe(16);
    expect(adapter.getHours(result)).toBe(0);
    expect(adapter.getMinutes(result)).toBe(0);
    expect(adapter.getSeconds(result)).toBe(30);
  });

  it('should handle negative seconds in addSeconds', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 0, 0, 30);
    const result = adapter.addSeconds(withTime, -60);

    // Should roll back to previous day
    expect(adapter.getDate(result)).toBe(14);
    expect(adapter.getHours(result)).toBe(23);
    expect(adapter.getMinutes(result)).toBe(59);
    expect(adapter.getSeconds(result)).toBe(30);
  });

  it('should compare times', () => {
    // Use different dates to guarantee that we only compare the times.
    const date1 = adapter.createDate(2024, JAN, 1);
    const date2 = adapter.createDate(2024, FEB, 7);

    const time1 = adapter.setTime(date1, 12, 0, 0);
    const time2 = adapter.setTime(date2, 13, 0, 0);
    expect(adapter.compareTime(time1, time2)).toBeLessThan(0);

    const time3 = adapter.setTime(date1, 12, 50, 0);
    const time4 = adapter.setTime(date2, 12, 51, 0);
    expect(adapter.compareTime(time3, time4)).toBeLessThan(0);

    const time5 = adapter.setTime(date1, 1, 2, 3);
    const time6 = adapter.setTime(date2, 1, 2, 3);
    expect(adapter.compareTime(time5, time6)).toBe(0);

    const time7 = adapter.setTime(date1, 13, 0, 0);
    const time8 = adapter.setTime(date2, 12, 0, 0);
    expect(adapter.compareTime(time7, time8)).toBeGreaterThan(0);

    const time9 = adapter.setTime(date1, 12, 50, 11);
    const time10 = adapter.setTime(date2, 12, 50, 10);
    expect(adapter.compareTime(time9, time10)).toBeGreaterThan(0);
  });
});

describe('TemporalDateAdapter with zoned mode and UTC timezone', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', timezone: 'UTC'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should create ZonedDateTime in UTC timezone', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
    expect((date as unknown as {timeZoneId: string}).timeZoneId).toBe('UTC');
  });

  it('should handle time operations like zoned mode', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
    expect(adapter.getMinutes(withTime)).toBe(30);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should add seconds correctly', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 12, 30, 0);
    const result = adapter.addSeconds(withTime, 90);
    expect(adapter.getMinutes(result)).toBe(31);
    expect(adapter.getSeconds(result)).toBe(30);
  });

  it('should get today in UTC', () => {
    const today = adapter.today();
    expect(adapter.isValid(today)).toBe(true);
    expect((today as unknown as {timeZoneId: string}).timeZoneId).toBe('UTC');
  });

  it('should parse ISO string correctly', () => {
    const date = adapter.parse('2024-01-15', null);
    expect(date).not.toBeNull();
    expect(adapter.isValid(date!)).toBe(true);
    expect(adapter.getYear(date!)).toBe(2024);
    expect(adapter.getMonth(date!)).toBe(0);
    expect(adapter.getDate(date!)).toBe(15);
  });
});

describe('TemporalDateAdapter with overflow: constrain', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'date', overflow: 'constrain'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should constrain Feb 31 to Feb 28 in non-leap year', () => {
    const date = adapter.createDate(2023, FEB, 31);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getMonth(date)).toBe(1); // February
    expect(adapter.getDate(date)).toBe(28);
  });

  it('should constrain Feb 31 to Feb 29 in leap year', () => {
    const date = adapter.createDate(2024, FEB, 31);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getMonth(date)).toBe(1); // February
    expect(adapter.getDate(date)).toBe(29);
  });

  it('should constrain Apr 31 to Apr 30', () => {
    const date = adapter.createDate(2024, APR, 31);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getMonth(date)).toBe(3); // April
    expect(adapter.getDate(date)).toBe(30);
  });

  it('should constrain day 50 to end of month', () => {
    const date = adapter.createDate(2024, JAN, 50);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getDate(date)).toBe(31); // January has 31 days
  });

  it('should handle valid dates normally', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getDate(date)).toBe(15);
  });
});

describe('TemporalDateAdapter with overflow: reject (default)', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'date', overflow: 'reject'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should throw for Feb 31', () => {
    expect(() => adapter.createDate(2024, FEB, 31)).toThrow();
  });

  it('should throw for Apr 31', () => {
    expect(() => adapter.createDate(2024, APR, 31)).toThrow();
  });

  it('should allow valid dates', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
  });
});

describe('TemporalDateAdapter with calendar from Intl', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    // Get calendar string from Intl (this is the pattern users will likely use)
    const intlCalendar = new Intl.DateTimeFormat().resolvedOptions().calendar;

    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            // Calendar from Intl is always a string
            calendar: intlCalendar,
            mode: 'date',
          },
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should create date with calendar from Intl.DateTimeFormat', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should use user locale calendar system', () => {
    // The calendar string from Intl should work correctly
    const today = adapter.today();
    expect(adapter.isValid(today)).toBe(true);
  });
});
