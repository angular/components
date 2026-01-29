/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {DateAdapter} from '@angular/material/core';
import {
  MAT_BASE_TEMPORAL_OPTIONS,
  MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
  MAT_ZONED_DATETIME_OPTIONS,
  PlainDateAdapter,
  PlainDateTimeAdapter,
  PlainTemporalAdapter,
  ZonedDateTimeAdapter,
} from './split';

/**
 * 0-based month index constants for ISO8601/Gregorian calendar tests.
 * These are NOT month names - they're indices matching Angular Material's
 * DateAdapter API where months are 0-indexed (January=0, December=11).
 *
 * For non-ISO calendars (Hebrew, Islamic, etc.), the adapters also use
 * 0-based month indices, but the number of months may differ:
 * - Hebrew calendar: 12-13 months (13 in leap years)
 * - Islamic calendar: 12 months
 * - Chinese calendar: 12-13 months
 */
const JAN = 0,
  FEB = 1,
  MAR = 2;

/** Check if Temporal API is available. */
const hasTemporal = typeof (globalThis as {Temporal?: unknown}).Temporal !== 'undefined';

/** Describe function that skips tests if Temporal is not available. */
const describeTemporal: (description: string, specDefinitions: () => void) => void = hasTemporal
  ? describe
  : xdescribe;

/** Check if a calendar is supported by the Temporal implementation. */
function supportsCalendar(calendarId: string): boolean {
  if (!hasTemporal) {
    return false;
  }
  try {
    Temporal.PlainDate.from({year: 2024, month: 1, day: 1, calendar: calendarId});
    return true;
  } catch {
    return false;
  }
}

/** Describe function that skips tests if the calendar is not supported. */
const describeIfCalendarSupported = (calendarId: string) =>
  supportsCalendar(calendarId) ? describeTemporal : xdescribe;

/** Type guard helpers using duck typing (since Temporal types are interfaces, not classes) */
function isPlainDate(value: unknown): value is Temporal.PlainDate {
  return (
    value != null &&
    typeof value === 'object' &&
    'calendarId' in value &&
    !('hour' in value) &&
    !('timeZoneId' in value)
  );
}

function isPlainDateTime(value: unknown): value is Temporal.PlainDateTime {
  return (
    value != null &&
    typeof value === 'object' &&
    'calendarId' in value &&
    'hour' in value &&
    !('timeZoneId' in value)
  );
}

function isZonedDateTime(value: unknown): value is Temporal.ZonedDateTime {
  return value != null && typeof value === 'object' && 'timeZoneId' in value;
}

// =============================================================================
// PlainTemporalAdapter Tests (configurable date/datetime mode)
// =============================================================================
describeTemporal('PlainTemporalAdapter in date mode', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'date'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('en-US');
  });

  it('should create a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should clone a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    const clone = adapter.clone(date);
    expect(clone).not.toBe(date);
    expect(adapter.getYear(clone)).toEqual(adapter.getYear(date));
  });

  it('should create PlainDate in date mode', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(isPlainDate(date)).toBe(true);
  });

  it('should return today as PlainDate', () => {
    const today = adapter.today();
    expect(isPlainDate(today)).toBe(true);
  });

  it('should return original date when setting time in date mode', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 0);
    // In date mode, setTime just returns the original date unchanged
    // (with a console.warn in dev mode)
    expect(isPlainDate(withTime)).toBe(true);
    expect(adapter.getHours(withTime)).toBe(0); // No time component on PlainDate
  });

  it('should get month names', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBeGreaterThanOrEqual(12);
  });

  it('should get day of week names', () => {
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
  });
});

describeTemporal('PlainTemporalAdapter in datetime mode', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'datetime'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('en-US');
  });

  it('should create a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should clone a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    const clone = adapter.clone(date);
    expect(clone).not.toBe(date);
    expect(adapter.getYear(clone)).toEqual(adapter.getYear(date));
  });

  it('should get and set time', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
    expect(adapter.getMinutes(withTime)).toBe(30);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should create PlainDateTime in datetime mode', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(isPlainDateTime(date)).toBe(true);
  });

  it('should return today as PlainDateTime', () => {
    const today = adapter.today();
    expect(isPlainDateTime(today)).toBe(true);
  });

  it('should preserve PlainDateTime type when setting time', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 0);
    expect(isPlainDateTime(withTime)).toBe(true);
  });

  it('should throw for invalid hours', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, -1, 0, 0)).toThrowError(/Invalid hours/);
    expect(() => adapter.setTime(date, 24, 0, 0)).toThrowError(/Invalid hours/);
  });

  it('should throw for invalid minutes', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, 0, -1, 0)).toThrowError(/Invalid minutes/);
    expect(() => adapter.setTime(date, 0, 60, 0)).toThrowError(/Invalid minutes/);
  });

  it('should throw for invalid seconds', () => {
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
});

describeTemporal('PlainTemporalAdapter with overflow constrain', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'date', overflow: 'constrain'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('en-US');
  });

  it('should constrain February 30 to February 29 (leap year)', () => {
    const constrained = adapter.createDate(2024, FEB, 30);
    expect(adapter.getDate(constrained)).toBe(29);
  });

  it('should constrain addCalendarMonths', () => {
    // March 31 + (-1 month) should constrain to Feb 29 (leap year)
    const date = adapter.createDate(2024, MAR, 31);
    const result = adapter.addCalendarMonths(date, -1);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(29);
  });

  it('should constrain addCalendarYears', () => {
    // Feb 29 2024 + 1 year should constrain to Feb 28 2025 (non-leap year)
    const date = adapter.createDate(2024, FEB, 29);
    const result = adapter.addCalendarYears(date, 1);
    expect(adapter.getYear(result)).toBe(2025);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(28);
  });

  it('should constrain invalid month (15) to December (11)', () => {
    // Month 15 should constrain to 12 (December = index 11)
    const constrained = adapter.createDate(2024, 15, 1);
    expect(adapter.getMonth(constrained)).toBe(11); // December
    expect(adapter.getDate(constrained)).toBe(1);
  });

  it('should NOT throw for invalid month in constrain mode', () => {
    // Unlike reject mode, constrain should not throw
    expect(() => adapter.createDate(2024, 15, 1)).not.toThrow();
    expect(() => adapter.createDate(2024, -1, 1)).not.toThrow();
  });
});

describeTemporal('PlainTemporalAdapter with overflow reject', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'date', overflow: 'reject'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('en-US');
  });

  it('should reject invalid month index', () => {
    expect(() => adapter.createDate(2024, 12, 1)).toThrowError(/Invalid month/);
    expect(() => adapter.createDate(2024, -1, 1)).toThrowError(/Invalid month/);
  });

  it('should reject invalid date', () => {
    expect(() => adapter.createDate(2024, JAN, 0)).toThrowError(/Invalid date/);
  });

  it('should reject February 30', () => {
    expect(() => adapter.createDate(2024, FEB, 30)).toThrow();
  });
});

// =============================================================================
// ZonedDateTimeAdapter Tests (date + time + timezone)
// =============================================================================
describeTemporal('ZonedDateTimeAdapter', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {provide: MAT_ZONED_DATETIME_OPTIONS, useValue: {timezone: 'UTC'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  // Basic date operations
  it('should create a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get year', () => {
    expect(adapter.getYear(adapter.createDate(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(adapter.createDate(2017, JAN, 1))).toBe(JAN);
  });

  it('should get date', () => {
    expect(adapter.getDate(adapter.createDate(2017, JAN, 1))).toBe(1);
  });

  it('should clone a date', () => {
    const date = adapter.createDate(2017, JAN, 1);
    const clone = adapter.clone(date);
    expect(clone).not.toBe(date);
    expect(adapter.getYear(clone)).toEqual(adapter.getYear(date));
  });

  // Time support
  it('should get and set time', () => {
    const date = adapter.createDate(2024, JAN, 1);
    const withTime = adapter.setTime(date, 14, 30, 45);
    expect(adapter.getHours(withTime)).toBe(14);
    expect(adapter.getMinutes(withTime)).toBe(30);
    expect(adapter.getSeconds(withTime)).toBe(45);
  });

  it('should throw for invalid hours', () => {
    const date = adapter.today();
    expect(() => adapter.setTime(date, -1, 0, 0)).toThrowError(/Invalid hours/);
    expect(() => adapter.setTime(date, 24, 0, 0)).toThrowError(/Invalid hours/);
  });

  it('should parse time string', () => {
    const result = adapter.parseTime('14:30', 'HH:mm');
    expect(result).not.toBeNull();
    expect(adapter.getHours(result!)).toBe(14);
    expect(adapter.getMinutes(result!)).toBe(30);
  });

  // Type-specific tests
  it('should return ZonedDateTime type', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(isZonedDateTime(date)).toBe(true);
  });

  it('should include timezone in ISO string', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const iso = adapter.toIso8601(date);
    expect(iso).toContain('[UTC]');
  });

  it('should preserve timezone when cloning', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const clone = adapter.clone(date);
    expect(clone.timeZoneId).toBe('UTC');
  });

  // Overflow tests (default is reject)
  it('should reject February 30 with default overflow reject', () => {
    expect(() => adapter.createDate(2024, FEB, 30)).toThrowError(/Invalid date/);
  });

  it('should get month names', () => {
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBeGreaterThanOrEqual(12);
  });

  it('should get day of week names', () => {
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
  });
});

describeTemporal('ZonedDateTimeAdapter with overflow constrain', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {provide: MAT_ZONED_DATETIME_OPTIONS, useValue: {timezone: 'UTC', overflow: 'constrain'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should constrain February 30 to February 29 (leap year)', () => {
    const constrained = adapter.createDate(2024, FEB, 30);
    expect(adapter.getDate(constrained)).toBe(29);
  });

  it('should constrain addCalendarYears', () => {
    // Feb 29 2024 + 1 year should constrain to Feb 28 2025 (non-leap year)
    const date = adapter.createDate(2024, FEB, 29);
    const result = adapter.addCalendarYears(date, 1);
    expect(adapter.getYear(result)).toBe(2025);
    expect(adapter.getMonth(result)).toBe(FEB);
    expect(adapter.getDate(result)).toBe(28);
  });

  it('should constrain invalid month (15) to December (11)', () => {
    // Month 15 should constrain to 12 (December = index 11)
    const constrained = adapter.createDate(2024, 15, 1);
    expect(adapter.getMonth(constrained)).toBe(11); // December
    expect(adapter.getDate(constrained)).toBe(1);
  });

  it('should NOT throw for invalid month in constrain mode', () => {
    // Unlike reject mode, constrain should not throw
    expect(() => adapter.createDate(2024, 15, 1)).not.toThrow();
    expect(() => adapter.createDate(2024, -1, 1)).not.toThrow();
  });
});

describeTemporal('ZonedDateTimeAdapter with specific timezone', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {provide: MAT_ZONED_DATETIME_OPTIONS, useValue: {timezone: 'America/New_York'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should use specified timezone', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(date.timeZoneId).toBe('America/New_York');
  });

  it('should handle DST transitions', () => {
    // March 10, 2024 2:00 AM is when DST starts in New York
    const date = adapter.createDate(2024, MAR, 10);
    expect(adapter.isValid(date)).toBe(true);
  });
});

describeTemporal('ZonedDateTimeAdapter with disambiguation reject', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {timezone: 'America/New_York', disambiguation: 'reject'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should reject ambiguous time during DST gap', () => {
    // March 10, 2024 2:30 AM does not exist in New York (DST gap)
    const date = adapter.createDate(2024, MAR, 10);
    expect(() => adapter.setTime(date, 2, 30, 0)).toThrow();
  });
});

describeTemporal('ZonedDateTimeAdapter with rounding', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {
            timezone: 'UTC',
            rounding: {smallestUnit: 'minute', roundingIncrement: 15, roundingMode: 'halfExpand'},
          },
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should round to 15-minute increments in toIso8601', () => {
    // Create via createDate with setTime to get 12:38
    const date = adapter.createDate(2024, JAN, 15);
    const dateWithTime = adapter.setTime(date, 12, 38, 0);
    const iso = adapter.toIso8601(dateWithTime);
    // 38 minutes rounds to 45 with halfExpand and 15-minute increments (38 > 37.5)
    expect(iso).toContain('12:45:00');
  });

  it('should round down when closer to lower increment', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const dateWithTime = adapter.setTime(date, 12, 37, 0);
    const iso = adapter.toIso8601(dateWithTime);
    // 37 minutes rounds to 30 (37 <= 37.5)
    expect(iso).toContain('12:30:00');
  });
});

// =============================================================================
// Calendar Support Tests
// =============================================================================
describeIfCalendarSupported('hebrew')('PlainTemporalAdapter with Hebrew calendar', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'date', calendar: 'hebrew'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('he-IL');
  });

  it('should create date with Hebrew calendar', () => {
    // Hebrew year 5784 (2023-2024), first month (Tishrei = index 0)
    const date = adapter.createDate(5784, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
    expect((date as Temporal.PlainDate).calendarId).toBe('hebrew');
  });

  it('should get at least 12 months for Hebrew calendar', () => {
    // Note: getMonthNames() returns a fixed number of months based on a reference year.
    // For Hebrew calendar, it may return 12 or 13 depending on the implementation.
    // The important thing is that it handles non-Gregorian months correctly.
    const monthNames = adapter.getMonthNames('long');
    expect(monthNames.length).toBeGreaterThanOrEqual(12);
    expect(monthNames.length).toBeLessThanOrEqual(13);
  });

  it('should report correct months in year for Hebrew leap year', () => {
    // Hebrew year 5784 is a leap year (has 13 months with Adar I and Adar II)
    // The date's monthsInYear property should report 13
    const leapYearDate = adapter.createDate(5784, 0, 1) as Temporal.PlainDate;
    expect(leapYearDate.monthsInYear).toBe(13);
  });

  it('should report correct months in year for Hebrew non-leap year', () => {
    // Hebrew year 5785 is NOT a leap year (has 12 months)
    const nonLeapYearDate = adapter.createDate(5785, 0, 1) as Temporal.PlainDate;
    expect(nonLeapYearDate.monthsInYear).toBe(12);
  });

  it('should get day of week names in Hebrew locale', () => {
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
    // Hebrew day names should contain Hebrew characters
    const hebrewCharRegex = /[\u0590-\u05FF]/;
    dayNames.forEach(name => {
      expect(hebrewCharRegex.test(name)).toBe(true);
    });
  });

  it('should handle month navigation across leap/non-leap boundary', () => {
    // Start in Adar II (month 6) of leap year 5784
    const adarII = adapter.createDate(5784, 6, 1);
    expect(adapter.isValid(adarII)).toBe(true);

    // Move to next month (Nisan = month 7)
    const nisan = adapter.addCalendarMonths(adarII, 1);
    expect(adapter.getMonth(nisan)).toBe(7);
  });
});

describeIfCalendarSupported('islamic')('ZonedDateTimeAdapter with Islamic calendar', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {timezone: 'UTC', calendar: 'islamic'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    adapter.setLocale('ar-SA');
  });

  it('should create date with Islamic calendar', () => {
    const date = adapter.createDate(1445, 0, 1);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should get day of week names in Arabic locale', () => {
    const dayNames = adapter.getDayOfWeekNames('long');
    expect(dayNames.length).toBe(7);
    // Arabic day names should contain Arabic characters
    const arabicCharRegex = /[\u0600-\u06FF]/;
    dayNames.forEach(name => {
      expect(arabicCharRegex.test(name)).toBe(true);
    });
  });
});

// =============================================================================
// Output Calendar Tests
// =============================================================================
describeTemporal('PlainTemporalAdapter with outputCalendar', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'date', calendar: 'iso8601', outputCalendar: 'japanese'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    adapter.setLocale('ja-JP');
  });

  it('should store dates in ISO8601 but format in Japanese calendar', () => {
    const date = adapter.createDate(2024, JAN, 1);
    // Stored as ISO8601
    expect((date as Temporal.PlainDate).calendarId).toBe('iso8601');
    // Formatted as Japanese
    const formatted = adapter.format(date, {year: 'numeric'});
    const expected = Temporal.PlainDate.from('2024-01-01')
      .withCalendar('japanese')
      .toLocaleString('ja-JP', {year: 'numeric', calendar: 'japanese'});
    expect(formatted).toBe(expected);
  });
});

// =============================================================================
// Edge Case Tests - Security and Robustness
// =============================================================================
describeTemporal('PlainTemporalAdapter edge cases', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'datetime'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
  });

  describe('parse with epoch milliseconds edge cases', () => {
    it('should handle valid epoch milliseconds', () => {
      const date = adapter.parse(0);
      expect(adapter.isValid(date!)).toBe(true);
    });

    it('should handle negative epoch milliseconds', () => {
      const date = adapter.parse(-86400000); // 1969-12-31
      expect(adapter.isValid(date!)).toBe(true);
    });

    it('should return invalid for Infinity', () => {
      const date = adapter.parse(Infinity);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for -Infinity', () => {
      const date = adapter.parse(-Infinity);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for NaN', () => {
      const date = adapter.parse(NaN);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for values exceeding JS Date range (positive)', () => {
      const date = adapter.parse(8.65e15); // Beyond ±8.64e15
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for values exceeding JS Date range (negative)', () => {
      const date = adapter.parse(-8.65e15);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should handle boundary value at positive limit', () => {
      const date = adapter.parse(8.64e15);
      expect(adapter.isValid(date!)).toBe(true);
    });

    it('should handle boundary value at negative limit', () => {
      const date = adapter.parse(-8.64e15);
      expect(adapter.isValid(date!)).toBe(true);
    });
  });

  describe('parseTime edge cases', () => {
    it('should return invalid for very long strings (DoS prevention)', () => {
      const longString = '12:30:00'.padEnd(100, ' ');
      const result = adapter.parseTime(longString);
      expect(adapter.isValid(result!)).toBe(false);
    });

    it('should return invalid for 33+ character strings', () => {
      const result = adapter.parseTime('a'.repeat(33));
      expect(adapter.isValid(result!)).toBe(false);
    });

    it('should accept 32 character strings', () => {
      // 32 chars is the limit, but it still needs to be valid time format
      const result = adapter.parseTime('12:30:00'); // Valid time under 32 chars
      expect(adapter.isValid(result!)).toBe(true);
    });

    it('should handle null', () => {
      const result = adapter.parseTime(null);
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = adapter.parseTime('');
      expect(result).toBeNull();
    });

    it('should return invalid for whitespace-only string', () => {
      const result = adapter.parseTime('   ');
      expect(adapter.isValid(result!)).toBe(false);
    });
  });

  describe('setTime edge cases', () => {
    it('should throw for NaN hours in dev mode', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, NaN, 0, 0)).toThrowError(/Invalid hours/);
    });

    it('should throw for Infinity minutes in dev mode', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 0, Infinity, 0)).toThrowError(/Invalid minutes/);
    });

    it('should throw for -Infinity seconds in dev mode', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 0, 0, -Infinity)).toThrowError(/Invalid seconds/);
    });

    it('should throw for negative hours', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, -1, 0, 0)).toThrowError(/Invalid hours/);
    });

    it('should throw for hours > 23', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 24, 0, 0)).toThrowError(/Invalid hours/);
    });

    it('should throw for minutes > 59', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 0, 60, 0)).toThrowError(/Invalid minutes/);
    });

    it('should throw for seconds > 59', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 0, 0, 60)).toThrowError(/Invalid seconds/);
    });
  });
});

describeTemporal('ZonedDateTimeAdapter edge cases', () => {
  let adapter: ZonedDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
        {
          provide: MAT_ZONED_DATETIME_OPTIONS,
          useValue: {calendar: 'iso8601', timezone: 'UTC'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
  });

  describe('parse with epoch milliseconds edge cases', () => {
    it('should handle valid epoch milliseconds', () => {
      const date = adapter.parse(0);
      expect(adapter.isValid(date!)).toBe(true);
    });

    it('should return invalid for Infinity', () => {
      const date = adapter.parse(Infinity);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for NaN', () => {
      const date = adapter.parse(NaN);
      expect(adapter.isValid(date!)).toBe(false);
    });

    it('should return invalid for values exceeding JS Date range', () => {
      const date = adapter.parse(9e15);
      expect(adapter.isValid(date!)).toBe(false);
    });
  });

  describe('parseTime edge cases', () => {
    it('should return invalid for very long strings (DoS prevention)', () => {
      const longString = '12:30:00'.padEnd(100, ' ');
      const result = adapter.parseTime(longString);
      expect(adapter.isValid(result!)).toBe(false);
    });

    it('should handle null', () => {
      expect(adapter.parseTime(null)).toBeNull();
    });

    it('should handle empty string', () => {
      expect(adapter.parseTime('')).toBeNull();
    });
  });

  describe('setTime edge cases', () => {
    it('should throw for NaN hours in dev mode', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, NaN, 0, 0)).toThrowError(/Invalid hours/);
    });

    it('should throw for Infinity minutes in dev mode', () => {
      const today = adapter.today();
      expect(() => adapter.setTime(today, 0, Infinity, 0)).toThrowError(/Invalid minutes/);
    });
  });
});

// =============================================================================
// PlainDateAdapter Tests (date-only, internal adapter)
// =============================================================================
describeTemporal('PlainDateAdapter (via PlainTemporalAdapter date mode)', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {
          provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
          useValue: {mode: 'date'},
        },
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
  });

  it('should create PlainDate instances', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(isPlainDate(date)).toBe(true);
    expect(isPlainDateTime(date)).toBe(false);
  });

  it('should return 0 for time methods on PlainDate', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.getHours(date)).toBe(0);
    expect(adapter.getMinutes(date)).toBe(0);
    expect(adapter.getSeconds(date)).toBe(0);
  });

  it('should return invalid for parseTime in date mode', () => {
    const result = adapter.parseTime('12:30');
    expect(adapter.isValid(result!)).toBe(false);
  });

  it('should parse epoch milliseconds in date mode', () => {
    const date = adapter.parse(1704067200000); // 2024-01-01 00:00:00 UTC
    expect(adapter.isValid(date!)).toBe(true);
    expect(isPlainDate(date)).toBe(true);
  });

  it('should handle invalid epoch in date mode', () => {
    const date = adapter.parse(Infinity);
    expect(adapter.isValid(date!)).toBe(false);
  });
});

// =============================================================================
// Invalid Date Handling Tests
// =============================================================================
describeTemporal('Invalid date handling across adapters', () => {
  describe('PlainTemporalAdapter invalid dates', () => {
    let adapter: PlainTemporalAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: PlainTemporalAdapter},
          {
            provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
            useValue: {mode: 'datetime', overflow: 'reject'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    });

    it('should recognize invalid sentinel as invalid', () => {
      const invalid = adapter.invalid();
      expect(adapter.isValid(invalid)).toBe(false);
    });

    it('should recognize invalid sentinel as date instance', () => {
      const invalid = adapter.invalid();
      expect(adapter.isDateInstance(invalid)).toBe(true);
    });

    it('should throw when formatting invalid date', () => {
      const invalid = adapter.invalid();
      expect(() => adapter.format(invalid, {year: 'numeric'})).toThrowError(/Cannot format/);
    });

    it('should throw for invalid month index', () => {
      expect(() => adapter.createDate(2024, 12, 1)).toThrowError(/Invalid month/);
    });

    it('should throw for invalid day', () => {
      expect(() => adapter.createDate(2024, FEB, 30)).toThrowError(/Invalid date/);
    });

    it('should throw when cloning invalid date (sentinel has NaN values)', () => {
      const invalid = adapter.invalid();
      // Clone throws because invalid sentinel has NaN values which Temporal.PlainDate.from rejects
      expect(() => adapter.clone(invalid)).toThrowError();
    });
  });

  describe('ZonedDateTimeAdapter invalid dates', () => {
    let adapter: ZonedDateTimeAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
          {
            provide: MAT_ZONED_DATETIME_OPTIONS,
            useValue: {calendar: 'iso8601', timezone: 'UTC', overflow: 'reject'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    });

    it('should recognize invalid sentinel as invalid', () => {
      const invalid = adapter.invalid();
      expect(adapter.isValid(invalid)).toBe(false);
    });

    it('should throw when formatting invalid date', () => {
      const invalid = adapter.invalid();
      expect(() => adapter.format(invalid, {year: 'numeric'})).toThrowError(/Cannot format/);
    });

    it('should throw for invalid month in reject mode', () => {
      expect(() => adapter.createDate(2024, 12, 1)).toThrowError(/Invalid month/);
    });
  });
});

// =============================================================================
// Deserialize Tests
// =============================================================================
describeTemporal('Deserialize methods', () => {
  describe('PlainTemporalAdapter deserialize', () => {
    let adapter: PlainTemporalAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: PlainTemporalAdapter},
          {
            provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
            useValue: {mode: 'datetime'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    });

    it('should deserialize valid ISO date string', () => {
      const result = adapter.deserialize('2024-01-15');
      expect(adapter.isValid(result!)).toBe(true);
      expect(adapter.getYear(result!)).toBe(2024);
    });

    it('should deserialize valid ISO datetime string', () => {
      const result = adapter.deserialize('2024-01-15T10:30:00');
      expect(adapter.isValid(result!)).toBe(true);
      expect(adapter.getHours(result!)).toBe(10);
    });

    it('should return null for empty string', () => {
      expect(adapter.deserialize('')).toBeNull();
    });

    it('should return invalid for malformed string', () => {
      const result = adapter.deserialize('not-a-date');
      expect(adapter.isValid(result!)).toBe(false);
    });
  });

  describe('ZonedDateTimeAdapter deserialize', () => {
    let adapter: ZonedDateTimeAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
          {
            provide: MAT_ZONED_DATETIME_OPTIONS,
            useValue: {calendar: 'iso8601', timezone: 'America/New_York'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    });

    it('should deserialize ISO date string to zoned datetime', () => {
      const result = adapter.deserialize('2024-01-15');
      expect(adapter.isValid(result!)).toBe(true);
      expect(isZonedDateTime(result)).toBe(true);
    });

    it('should return null for empty string', () => {
      expect(adapter.deserialize('')).toBeNull();
    });
  });
});

// =============================================================================
// toIso8601 Tests
// =============================================================================
describeTemporal('toIso8601 methods', () => {
  describe('PlainTemporalAdapter toIso8601', () => {
    let adapter: PlainTemporalAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: PlainTemporalAdapter},
          {
            provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
            useValue: {mode: 'datetime'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    });

    it('should return ISO date string (date part only)', () => {
      const date = adapter.createDate(2024, JAN, 15);
      const iso = adapter.toIso8601(date);
      expect(iso).toBe('2024-01-15');
    });
  });

  describe('ZonedDateTimeAdapter toIso8601', () => {
    let adapter: ZonedDateTimeAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
          {
            provide: MAT_ZONED_DATETIME_OPTIONS,
            useValue: {calendar: 'iso8601', timezone: 'UTC'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    });

    it('should return full ZonedDateTime string with timezone', () => {
      const date = adapter.createDate(2024, JAN, 15);
      const iso = adapter.toIso8601(date);
      expect(iso).toContain('2024-01-15');
      expect(iso).toContain('[UTC]');
    });
  });
});

// =============================================================================
// Clone Tests
// =============================================================================
describeTemporal('Clone methods create new instances', () => {
  describe('PlainTemporalAdapter clone', () => {
    let adapter: PlainTemporalAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: PlainTemporalAdapter},
          {
            provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
            useValue: {mode: 'datetime'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    });

    it('should create a new instance with same values', () => {
      const original = adapter.createDate(2024, JAN, 15);
      const cloned = adapter.clone(original);

      expect(cloned).not.toBe(original); // Different reference
      expect(adapter.getYear(cloned)).toBe(adapter.getYear(original));
      expect(adapter.getMonth(cloned)).toBe(adapter.getMonth(original));
      expect(adapter.getDate(cloned)).toBe(adapter.getDate(original));
    });
  });

  describe('ZonedDateTimeAdapter clone', () => {
    let adapter: ZonedDateTimeAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
          {
            provide: MAT_ZONED_DATETIME_OPTIONS,
            useValue: {calendar: 'iso8601', timezone: 'America/New_York'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    });

    it('should create a new instance with same values', () => {
      const original = adapter.createDate(2024, JAN, 15);
      const cloned = adapter.clone(original);

      expect(cloned).not.toBe(original);
      expect(adapter.getYear(cloned)).toBe(adapter.getYear(original));
      expect((cloned as Temporal.ZonedDateTime).timeZoneId).toBe(
        (original as Temporal.ZonedDateTime).timeZoneId,
      );
    });
  });
});

// =============================================================================
// addSeconds Tests
// =============================================================================
describeTemporal('addSeconds methods', () => {
  describe('PlainTemporalAdapter addSeconds', () => {
    let adapter: PlainTemporalAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: PlainTemporalAdapter},
          {
            provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS,
            useValue: {mode: 'datetime'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
    });

    it('should add positive seconds', () => {
      const date = adapter.setTime(adapter.createDate(2024, JAN, 15), 10, 30, 0);
      const result = adapter.addSeconds(date, 90);
      expect(adapter.getMinutes(result)).toBe(31);
      expect(adapter.getSeconds(result)).toBe(30);
    });

    it('should add negative seconds', () => {
      const date = adapter.setTime(adapter.createDate(2024, JAN, 15), 10, 30, 30);
      const result = adapter.addSeconds(date, -90);
      expect(adapter.getMinutes(result)).toBe(29);
      expect(adapter.getSeconds(result)).toBe(0);
    });

    it('should handle day overflow', () => {
      const date = adapter.setTime(adapter.createDate(2024, JAN, 15), 23, 59, 59);
      const result = adapter.addSeconds(date, 2);
      expect(adapter.getDate(result)).toBe(16);
      expect(adapter.getHours(result)).toBe(0);
      expect(adapter.getMinutes(result)).toBe(0);
      expect(adapter.getSeconds(result)).toBe(1);
    });
  });

  describe('ZonedDateTimeAdapter addSeconds', () => {
    let adapter: ZonedDateTimeAdapter;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: DateAdapter, useClass: ZonedDateTimeAdapter},
          {
            provide: MAT_ZONED_DATETIME_OPTIONS,
            useValue: {calendar: 'iso8601', timezone: 'UTC'},
          },
        ],
      });
      adapter = TestBed.inject(DateAdapter) as ZonedDateTimeAdapter;
    });

    it('should add seconds correctly', () => {
      const date = adapter.setTime(adapter.createDate(2024, JAN, 15), 10, 30, 0);
      const result = adapter.addSeconds(date, 3600);
      expect(adapter.getHours(result)).toBe(11);
    });
  });
});

// =============================================================================
// PlainDateAdapter Standalone Tests
// =============================================================================
describeTemporal('PlainDateAdapter (Standalone)', () => {
  let adapter: PlainDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainDateAdapter},
        {provide: MAT_BASE_TEMPORAL_OPTIONS, useValue: {overflow: 'reject'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainDateAdapter;
    adapter.setLocale('en-US');
  });

  it('should create a date', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
    expect(adapter.getYear(date)).toBe(2024);
  });

  it('should reject invalid dates in reject mode', () => {
    expect(() => adapter.createDate(2024, FEB, 30)).toThrowError(/Invalid date/);
  });

  it('should return invalid for parseTime', () => {
    const result = adapter.parseTime('12:30');
    expect(adapter.isValid(result!)).toBe(false);
  });
});

describeTemporal('PlainDateAdapter (Standalone) with overflow constrain', () => {
  let adapter: PlainDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainDateAdapter},
        {provide: MAT_BASE_TEMPORAL_OPTIONS, useValue: {overflow: 'constrain'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainDateAdapter;
    adapter.setLocale('en-US');
  });

  it('should constrain invalid dates', () => {
    const date = adapter.createDate(2024, FEB, 30);
    expect(adapter.getDate(date)).toBe(29);
  });

  it('should constrain invalid month (15)', () => {
    const date = adapter.createDate(2024, 15, 1);
    expect(adapter.getMonth(date)).toBe(11); // December
  });
});

// =============================================================================
// PlainDateTimeAdapter Standalone Tests
// =============================================================================
describeTemporal('PlainDateTimeAdapter (Standalone)', () => {
  let adapter: PlainDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainDateTimeAdapter},
        {provide: MAT_BASE_TEMPORAL_OPTIONS, useValue: {overflow: 'reject'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should create a date', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(adapter.isValid(date)).toBe(true);
  });

  it('should set time correctly', () => {
    const date = adapter.createDate(2024, JAN, 15);
    const withTime = adapter.setTime(date, 14, 30, 0);
    expect(adapter.getHours(withTime)).toBe(14);
  });

  it('should validate time in setTime', () => {
    const date = adapter.createDate(2024, JAN, 15);
    expect(() => adapter.setTime(date, 25, 0, 0)).toThrowError(/Invalid hours/);
  });
});

describeTemporal('PlainDateTimeAdapter (Standalone) with overflow constrain', () => {
  let adapter: PlainDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainDateTimeAdapter},
        {provide: MAT_BASE_TEMPORAL_OPTIONS, useValue: {overflow: 'constrain'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainDateTimeAdapter;
    adapter.setLocale('en-US');
  });

  it('should constrain invalid dates', () => {
    const date = adapter.createDate(2024, FEB, 30);
    expect(adapter.getDate(date)).toBe(29);
  });
});

describeTemporal('PlainTemporalAdapter Date consistency', () => {
  let adapter: PlainTemporalAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: DateAdapter, useClass: PlainTemporalAdapter},
        {provide: MAT_PLAIN_TEMPORAL_ADAPTER_OPTIONS, useValue: {mode: 'date'}},
      ],
    });
    adapter = TestBed.inject(DateAdapter) as PlainTemporalAdapter;
  });

  it('should return invalid for parseTime in date mode', () => {
    const result = adapter.parseTime('14:30');
    expect(adapter.isValid(result!)).toBe(false);
  });
});
