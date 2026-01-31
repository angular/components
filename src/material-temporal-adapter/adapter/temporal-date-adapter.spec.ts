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
import {
  MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
  MAT_ZONED_DATETIME_OPTIONS,
  PlainTemporalAdapter,
  ZonedDateTimeAdapter,
} from './split';

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

  it('should respect leap years when adding years (throws with reject overflow)', () => {
    const feb29 = adapter.createDate(2016, FEB, 29);
    // Default overflow is 'reject', so adding a year to Feb 29 should throw
    // since 2017 doesn't have Feb 29
    expect(() => adapter.addCalendarYears(feb29, 1)).toThrow();
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(adapter.createDate(2017, JAN, 1), 1)).toEqual(
      adapter.createDate(2017, FEB, 1),
    );
    expect(adapter.addCalendarMonths(adapter.createDate(2017, JAN, 1), -1)).toEqual(
      adapter.createDate(2016, DEC, 1),
    );
  });

  it('should respect month length differences when adding months (throws with reject overflow)', () => {
    const jan31 = adapter.createDate(2017, JAN, 31);
    // Default overflow is 'reject', so adding a month to Jan 31 should throw
    // since February doesn't have 31 days
    expect(() => adapter.addCalendarMonths(jan31, 1)).toThrow();
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

  it('should get day of week names in Hebrew locale regardless of calendar', () => {
    // Day-of-week names are locale-dependent, not calendar-dependent.
    // Hebrew locale should return Hebrew names regardless of calendar system.
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
    // Hebrew day names (Sunday = יום ראשון, etc.)
    // Verify they're Hebrew strings (contain Hebrew characters)
    const hebrewCharRegex = /[\u0590-\u05FF]/;
    dayNames.forEach(name => {
      expect(hebrewCharRegex.test(name)).toBe(true);
    });
  });
});

describeIfCalendarSupported('japanese')('TemporalDateAdapter with outputCalendar option', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', outputCalendar: 'japanese', mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
    adapter.setLocale('ja-JP');
  });

  it('should format using the output calendar', () => {
    const date = adapter.createDate(2024, 0, 1);
    const formatted = adapter.format(date, {year: 'numeric'});
    const expected = Temporal.PlainDate.from('2024-01-01')
      .withCalendar('japanese')
      .toLocaleString('ja-JP', {year: 'numeric', calendar: 'japanese'});

    expect(formatted).toBe(expected);
  });
});

describeIfCalendarSupported('japanese')(
  'TemporalDateAdapter outputCalendar with non-ISO calendar inputs',
  () => {
    let adapter: DateAdapter<TemporalDateType>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TemporalModule],
        providers: [
          {
            provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
            useValue: {calendar: 'japanese', outputCalendar: 'iso8601', mode: 'date'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter);
      adapter.setLocale('en-US');
    });

    it('should format without errors when outputCalendar differs', () => {
      const date = adapter.createDate(2024, JAN, 1);
      const formatted = adapter.format(date, {year: 'numeric'});
      const expected = Temporal.PlainDate.from('2024-01-01').toLocaleString('en-US', {
        year: 'numeric',
        calendar: 'iso8601',
      });
      expect(formatted).toBe(expected);
    });
  },
);

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

describe('TemporalDateAdapter with zoned options', () => {
  let adapter: DateAdapter<TemporalDateType>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'UTC',
            rounding: {smallestUnit: 'minute', roundingIncrement: 5},
            offset: 'ignore',
          },
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter);
  });

  it('should round zoned outputs when configured', () => {
    const zdt = Temporal.ZonedDateTime.from('2024-01-15T12:34:56+00:00[UTC]');
    const rounded = adapter.toIso8601(zdt);
    const expected = zdt.round({smallestUnit: 'minute', roundingIncrement: 5}).toString();
    expect(rounded).toBe(expected);
  });

  it('should honor offset handling when parsing zoned strings', () => {
    const value = '2019-12-23T12:00:00-02:00[America/Sao_Paulo]';
    const parsed = adapter.deserialize(value);
    expect(parsed).not.toBeNull();
    expect(adapter.isValid(parsed!)).toBe(true);
  });
});

describe('TemporalDateAdapter disambiguation options', () => {
  it('should throw for nonexistent local time when disambiguation is reject', () => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'America/New_York',
            disambiguation: 'reject',
          },
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const date = adapter.createDate(2024, MAR, 10); // DST spring-forward
    expect(() => adapter.setTime(date, 2, 5, 0)).toThrow();
  });

  it('should choose earlier vs later offsets for ambiguous local times', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'America/New_York',
            disambiguation: 'earlier',
          },
        },
      ],
    });
    const earlierAdapter = TestBed.inject(DateAdapter);
    const date = earlierAdapter.createDate(2024, NOV, 3); // DST fall-back
    const earlier = earlierAdapter.setTime(date, 1, 5, 0) as Temporal.ZonedDateTime;
    expect(earlier.toString()).toContain('-04:00');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'America/New_York',
            disambiguation: 'later',
          },
        },
      ],
    });
    const laterAdapter = TestBed.inject(DateAdapter);
    const later = laterAdapter.setTime(date, 1, 5, 0) as Temporal.ZonedDateTime;
    expect(later.toString()).toContain('-05:00');
  });

  it('should use compatible behavior for gaps and overlaps', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'America/New_York',
            disambiguation: 'compatible',
          },
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);

    const gapDate = adapter.createDate(2024, MAR, 10);
    const gapResult = adapter.setTime(gapDate, 2, 5, 0) as Temporal.ZonedDateTime;
    const gapExpected = Temporal.PlainDateTime.from('2024-03-10T02:05')
      .toZonedDateTime('America/New_York', {disambiguation: 'compatible'})
      .toString();
    expect(gapResult.toString()).toBe(gapExpected);

    const overlapDate = adapter.createDate(2024, NOV, 3);
    const overlapResult = adapter.setTime(overlapDate, 1, 5, 0) as Temporal.ZonedDateTime;
    const overlapExpected = Temporal.PlainDateTime.from('2024-11-03T01:05')
      .toZonedDateTime('America/New_York', {disambiguation: 'compatible'})
      .toString();
    expect(overlapResult.toString()).toBe(overlapExpected);
  });
});

describe('TemporalDateAdapter offset options', () => {
  it('should reject invalid offsets when configured', () => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', offset: 'reject'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = '2024-01-15T12:00:00+01:00[UTC]';
    let expected: string | null = null;
    try {
      expected = Temporal.ZonedDateTime.from(value, {offset: 'reject'}).toString();
    } catch {
      expected = null;
    }

    const parsed = adapter.deserialize(value);
    expect(parsed).not.toBeNull();
    if (expected === null) {
      expect(adapter.isValid(parsed!)).toBe(false);
    } else {
      expect((parsed as Temporal.ZonedDateTime).toString()).toBe(expected);
    }
  });

  it('should apply offset "use" when configured', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', offset: 'use'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = '2024-01-15T12:00:00+01:00[UTC]';
    const parsed = adapter.deserialize(value) as Temporal.ZonedDateTime;
    const expected = Temporal.ZonedDateTime.from(value, {offset: 'use'}).toString();
    expect(parsed.toString()).toBe(expected);
  });

  it('should apply offset "ignore" when configured', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', offset: 'ignore'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = '2019-12-23T12:00:00-02:00[America/Sao_Paulo]';
    const parsed = adapter.deserialize(value) as Temporal.ZonedDateTime;
    const expected = Temporal.ZonedDateTime.from(value, {offset: 'ignore'}).toString();
    expect(parsed.toString()).toBe(expected);
  });

  it('should apply offset "prefer" when configured', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', offset: 'prefer'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = '2019-12-23T12:00:00-02:00[America/Sao_Paulo]';
    const parsed = adapter.deserialize(value) as Temporal.ZonedDateTime;
    const expected = Temporal.ZonedDateTime.from(value, {offset: 'prefer'}).toString();
    expect(parsed.toString()).toBe(expected);
  });
});

describe('TemporalDateAdapter rounding options', () => {
  it('should apply roundingMode when configured', () => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'UTC',
            rounding: {
              smallestUnit: 'minute',
              roundingIncrement: 5,
              roundingMode: 'floor',
            },
          },
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = Temporal.ZonedDateTime.from('2024-01-15T12:34:56[UTC]');
    const expected = value
      .round({smallestUnit: 'minute', roundingIncrement: 5, roundingMode: 'floor'})
      .toString();
    expect(adapter.toIso8601(value)).toBe(expected);
  });

  it('should apply different smallestUnit values', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'UTC',
            rounding: {smallestUnit: 'hour'},
          },
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const value = Temporal.ZonedDateTime.from('2024-01-15T12:34:56[UTC]');
    const expected = value.round({smallestUnit: 'hour'}).toString();
    expect(adapter.toIso8601(value)).toBe(expected);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {
            calendar: 'iso8601',
            mode: 'zoned',
            timezone: 'UTC',
            rounding: {smallestUnit: 'day'},
          },
        },
      ],
    });
    const dayAdapter = TestBed.inject(DateAdapter);
    const dayExpected = value.round({smallestUnit: 'day'}).toString();
    expect(dayAdapter.toIso8601(value)).toBe(dayExpected);
  });
});

describe('Split adapters', () => {
  it('PlainTemporalAdapter should honor outputCalendar', () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'date', calendar: 'iso8601', outputCalendar: 'japanese'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('ja-JP');
    const date = adapter.createDate(2024, JAN, 1);
    const formatted = adapter.format(date, {year: 'numeric'});
    const expected = Temporal.PlainDate.from('2024-01-01')
      .withCalendar('japanese')
      .toLocaleString('ja-JP', {year: 'numeric', calendar: 'japanese'});
    expect(formatted).toBe(expected);
  });

  it('PlainTemporalAdapter should honor firstDayOfWeek and overflow', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'date', firstDayOfWeek: 1, overflow: 'constrain'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    expect(adapter.getFirstDayOfWeek()).toBe(1);
    const constrained = adapter.createDate(2024, FEB, 31);
    expect(adapter.getDate(constrained)).toBe(29);
  });

  it('PlainTemporalAdapter parseTime should set time on today', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'datetime'}},
      ],
    });
    const adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    const parsed = adapter.parseTime('12:30', 'HH:mm') as Temporal.PlainDateTime;
    expect(parsed.hour).toBe(12);
    expect(parsed.minute).toBe(30);
  });

  it('ZonedDateTimeAdapter should honor disambiguation and rounding', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {
            timezone: 'America/New_York',
            disambiguation: 'reject',
            rounding: {smallestUnit: 'minute', roundingIncrement: 5},
          },
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    const date = adapter.createDate(2024, MAR, 10);
    expect(() => adapter.setTime(date, 2, 5, 0)).toThrow();

    const rounded = adapter.toIso8601(
      Temporal.ZonedDateTime.from('2024-01-15T12:34:56[America/New_York]'),
    );
    const expected = Temporal.ZonedDateTime.from('2024-01-15T12:34:56[America/New_York]')
      .round({smallestUnit: 'minute', roundingIncrement: 5})
      .toString();
    expect(rounded).toBe(expected);
  });

  it('ZonedDateTimeAdapter should honor firstDayOfWeek and parseTime', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {timezone: 'UTC', firstDayOfWeek: 1},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    expect(adapter.getFirstDayOfWeek()).toBe(1);
    const parsed = adapter.parseTime('12:30', 'HH:mm') as Temporal.ZonedDateTime;
    expect(parsed.hour).toBe(12);
    expect(parsed.minute).toBe(30);
  });
});

describe('TemporalDateAdapter zoned parsing fallback', () => {
  it('should parse date-only strings into zoned values using the configured timezone', () => {
    TestBed.configureTestingModule({
      imports: [TemporalModule],
      providers: [
        {
          provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
          useValue: {calendar: 'iso8601', mode: 'zoned', timezone: 'UTC'},
        },
      ],
    });
    const adapter = TestBed.inject(DateAdapter);
    const parsed = adapter.deserialize('2024-01-15') as Temporal.ZonedDateTime;
    expect(adapter.isValid(parsed)).toBe(true);
    expect(parsed.toString()).toContain('[UTC]');
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

  it('should get day of week names in Arabic locale regardless of calendar', () => {
    // Day-of-week names are locale-dependent, not calendar-dependent.
    // Arabic locale should return Arabic names regardless of calendar system.
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
    // Arabic day names (Sunday = الأحد, etc.)
    // Verify they're Arabic strings (contain Arabic characters)
    const arabicCharRegex = /[\u0600-\u06FF]/;
    dayNames.forEach(name => {
      expect(arabicCharRegex.test(name)).toBe(true);
    });
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

  it('should throw for month rollover when adding months (reject mode)', () => {
    // January 31 + 1 month would be February 31, which is invalid
    // With default 'reject' overflow mode, this should throw
    const jan31 = adapter.createDate(2024, JAN, 31);
    expect(() => adapter.addCalendarMonths(jan31, 1)).toThrow();
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

  it('should constrain when adding years causes leap year overflow', () => {
    const feb29 = adapter.createDate(2024, FEB, 29); // 2024 is leap year
    const result = adapter.addCalendarYears(feb29, 1); // 2025 is NOT a leap year
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getYear(result)).toBe(2025);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(28); // Constrained to Feb 28
  });

  it('should constrain when adding months causes day overflow', () => {
    const jan31 = adapter.createDate(2024, JAN, 31);
    const result = adapter.addCalendarMonths(jan31, 1); // February has 29 days in 2024
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getYear(result)).toBe(2024);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(29); // Constrained to Feb 29
  });

  it('should constrain when subtracting years causes leap year overflow', () => {
    const feb29 = adapter.createDate(2024, FEB, 29);
    const result = adapter.addCalendarYears(feb29, -1); // 2023 is NOT a leap year
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getYear(result)).toBe(2023);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(28);
  });

  it('should constrain when adding months to 31st lands on 30-day month', () => {
    const may31 = adapter.createDate(2024, MAY, 31);
    const result = adapter.addCalendarMonths(may31, 1); // June has 30 days
    expect(adapter.isValid(result)).toBe(true);
    expect(adapter.getYear(result)).toBe(2024);
    expect(adapter.getMonth(result)).toBe(JUN);
    expect(adapter.getDate(result)).toBe(30);
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

  it('should throw when adding years causes leap year overflow', () => {
    const feb29 = adapter.createDate(2024, FEB, 29); // 2024 is leap year
    // Adding 1 year should throw because 2025 doesn't have Feb 29
    expect(() => adapter.addCalendarYears(feb29, 1)).toThrow();
  });

  it('should throw when subtracting years causes leap year overflow', () => {
    const feb29 = adapter.createDate(2024, FEB, 29);
    // Subtracting 1 year should throw because 2023 doesn't have Feb 29
    expect(() => adapter.addCalendarYears(feb29, -1)).toThrow();
  });

  it('should throw when adding months causes day overflow', () => {
    const jan31 = adapter.createDate(2024, JAN, 31);
    // Adding 1 month should throw because February doesn't have 31 days
    expect(() => adapter.addCalendarMonths(jan31, 1)).toThrow();
  });

  it('should throw when adding months to 31st lands on 30-day month', () => {
    const may31 = adapter.createDate(2024, MAY, 31);
    // Adding 1 month should throw because June only has 30 days
    expect(() => adapter.addCalendarMonths(may31, 1)).toThrow();
  });

  it('should not throw for valid year arithmetic', () => {
    const jan15 = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarYears(jan15, 1);
    expect(adapter.getYear(result)).toBe(2025);
    expect(adapter.getMonth(result)).toBe(JAN);
    expect(adapter.getDate(result)).toBe(15);
  });

  it('should not throw for valid month arithmetic', () => {
    const jan15 = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarMonths(jan15, 1);
    expect(adapter.getYear(result)).toBe(2024);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(15);
  });

  it('should not throw for valid day arithmetic', () => {
    const jan15 = adapter.createDate(2024, JAN, 15);
    const result = adapter.addCalendarDays(jan15, 10);
    expect(adapter.getDate(result)).toBe(25);
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

describe('TemporalDateAdapter strict consistency', () => {
  let adapter: TemporalDateAdapter;

  describe('with mode: "date"', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TemporalModule],
        providers: [
          {
            provide: MAT_TEMPORAL_DATE_ADAPTER_OPTIONS,
            useValue: {mode: 'date'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as TemporalDateAdapter;
    });

    it('should NOT allow time setting (returns strict original)', () => {
      spyOn(console, 'warn');
      const date = adapter.createDate(2024, JAN, 15);
      const withTime = adapter.setTime(date, 12, 30, 0);
      expect(console.warn).toHaveBeenCalled();
      // Should remain a PlainDate or effectively unchanged
      expect(withTime).toEqual(date);
    });

    it('should NOT allow parsing time strings implicitly', () => {
      const result = adapter.parseTime('12:30', 'HH:mm');
      expect(result).toBeTruthy();
      if (result) {
        expect(adapter.isValid(result)).toBe(false);
      }
    });

    it('should NOT allow addSeconds (returns strict original)', () => {
      spyOn(console, 'warn');
      const date = adapter.createDate(2024, JAN, 15);
      const result = adapter.addSeconds(date, 30);
      expect(console.warn).toHaveBeenCalled();
      expect(result).toEqual(date);
    });
  });
});
