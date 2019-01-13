/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_ID} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';
import {DateTime, Info, Features} from 'luxon';
import {LuxonDateModule} from './index';
import {MAT_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter} from './luxon-date-adapter';

// Month constants used for more readable tests. We can't use the
// ones from `material/testing`, because Luxon's months start from 1.
const JAN = 1, FEB = 2, MAR = 3, DEC = 12;

describe('LuxonDateAdapter', () => {
  let adapter: LuxonDateAdapter;
  let assertValidDate: (d: DateTime | null, valid: boolean) => void;
  let platform: Platform;
  let features: Features;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter, Platform], (dateAdapter: LuxonDateAdapter, p: Platform) => {
    adapter = dateAdapter;
    platform = p;
    features = Info.features();

    adapter.setLocale('en-US');
    assertValidDate = (d: DateTime | null, valid: boolean) => {
      expect(adapter.isDateInstance(d)).not.toBeNull(`Expected ${d} to be a date instance`);
      expect(adapter.isValid(d!)).toBe(valid,
          `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
          ` but was ${valid ? 'invalid' : 'valid'}`);
    };
  }));

  it('should get year', () => {
    expect(adapter.getYear(DateTime.local(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(DateTime.local(2017, JAN, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(DateTime.local(2017, JAN, 1))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(DateTime.local(2017, JAN, 1))).toBe(7);
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
    adapter.setLocale('da-DK');

    if (features.intl && features.intlTokens) {
      expect(adapter.getMonthNames('long')).toEqual([
        'januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli',
        'august', 'september', 'oktober', 'november', 'december'
      ]);
    } else {
      expect(adapter.getMonthNames('long')).toEqual([
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
      ]);
    }
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('da-DK');

    // Edge and IE support Intl, but have different data for Danish.
    if (features.intl && !(platform.EDGE || platform.TRIDENT)) {
      expect(adapter.getDateNames()).toEqual([
        '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.', '13.', '14.',
        '15.', '16.', '17.', '18.', '19.', '20.', '21.', '22.', '23.', '24.', '25.', '26.', '27.',
        '28.', '29.', '30.', '31.'
      ]);
    } else {
      expect(adapter.getDateNames()).toEqual([
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
        '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
      ]);
    }
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    ]);
  });

  it('should get narrow day of week names', () => {
    expect(adapter.getDayOfWeekNames('narrow')).toEqual([
      'M', 'T', 'W', 'T', 'F', 'S', 'S'
    ]);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');

    if (features.intl && features.intlTokens) {
      expect(adapter.getDayOfWeekNames('long')).toEqual([
        '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'
      ]);
    } else {
      expect(adapter.getDayOfWeekNames('long')).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    }
  });

  it('should get year name', () => {
    expect(adapter.getYearName(DateTime.local(2017, JAN, 1))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(DateTime.local(2017, JAN, 1))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should create Luxon date', () => {
    expect(adapter.createDate(2017, JAN, 1) instanceof DateTime).toBe(true);
  });

  it('should not create Luxon date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, 12, 1)).toThrow();
    expect(() => adapter.createDate(2017, -1, 1)).toThrow();
  });

  it('should not create Luxon date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), DateTime.local()))
        .toBe(true, "should be equal to today's date");
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'L/d/yyyy')!.toISO())
        .toEqual(DateTime.local(2017, JAN, 2).toISO());
    expect(adapter.parse('1/2/2017', 'd/L/yyyy')!.toISO())
        .toEqual(DateTime.local(2017, FEB, 1).toISO());
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'LL/dd/yyyy')!.toISO())
        .toEqual(DateTime.fromMillis(timestamp).toISO());
  });

  it('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'LL/dd/yyyy')!.toISO()).toEqual(DateTime.fromJSDate(date).toISO());
  });

  it('should parse DateTime', () => {
    let date = DateTime.local(2017, JAN, 1);
    expect(adapter.parse(date, 'LL/dd/yyyy')!.toISO()).toEqual(date.toISO());
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'LL/dd/yyyy')).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello', 'LL/dd/yyyy');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d)).toBe(true);
    expect(adapter.isValid(d as DateTime))
        .toBe(false, 'Expected to parse as "invalid date" object');
  });

  it('should format date according to given format', () => {
    expect(adapter.format(DateTime.local(2017, JAN, 2), 'LL/dd/yyyy')).toEqual('01/02/2017');
  });

  it('should format with a different locale', () => {
    let date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');

    expect(stripDirectionalityCharacters(date)).toEqual('Jan 2, 2017');
    adapter.setLocale('da-DK');

    date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');

    if (platform.EDGE || platform.TRIDENT) {
      expect(stripDirectionalityCharacters(date)).toEqual('2. jan 2017');
    } else {
      expect(stripDirectionalityCharacters(date)).toEqual('2. jan. 2017');
    }
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(DateTime.fromMillis(NaN), 'LL/dd/yyyy'))
        .toThrowError(/LuxonDateAdapter: Cannot format invalid date\./);
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(DateTime.local(2017, JAN, 1), 1).toISO())
        .toEqual(DateTime.local(2018, JAN, 1).toISO());
    expect(adapter.addCalendarYears(DateTime.local(2017, JAN, 1), -1).toISO())
        .toEqual(DateTime.local(2016, JAN, 1).toISO());
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(DateTime.local(2016, FEB, 29), 1).toISO())
        .toEqual(DateTime.local(2017, FEB, 28).toISO());
    expect(adapter.addCalendarYears(DateTime.local(2016, FEB, 29), -1).toISO())
        .toEqual(DateTime.local(2015, FEB, 28).toISO());
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 1), 1).toISO())
        .toEqual(DateTime.local(2017, FEB, 1).toISO());
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 1), -1).toISO())
        .toEqual(DateTime.local(2016, DEC, 1).toISO());
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(DateTime.local(2017, JAN, 31), 1).toISO())
        .toEqual(DateTime.local(2017, FEB, 28).toISO());
    expect(adapter.addCalendarMonths(DateTime.local(2017, MAR, 31), -1).toISO())
        .toEqual(DateTime.local(2017, FEB, 28).toISO());
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(DateTime.local(2017, JAN, 1), 1).toISO())
        .toEqual(DateTime.local(2017, JAN, 2).toISO());
    expect(adapter.addCalendarDays(DateTime.local(2017, JAN, 1), -1).toISO())
        .toEqual(DateTime.local(2016, DEC, 31).toISO());
  });

  it('should clone', () => {
    let date = DateTime.local(2017, JAN, 1);
    let clone = adapter.clone(date);

    expect(clone).not.toBe(date);
    expect(clone.toISO()).toEqual(date.toISO());
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, JAN, 2)))
        .toBeLessThan(0);

    expect(adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, FEB, 1)))
        .toBeLessThan(0);

    expect(adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2018, JAN, 1)))
        .toBeLessThan(0);

    expect(adapter.compareDate(DateTime.local(2017, JAN, 1), DateTime.local(2017, JAN, 1))).toBe(0);

    expect(adapter.compareDate(DateTime.local(2018, JAN, 1), DateTime.local(2017, JAN, 1)))
        .toBeGreaterThan(0);

    expect(adapter.compareDate(DateTime.local(2017, FEB, 1), DateTime.local(2017, JAN, 1)))
        .toBeGreaterThan(0);

    expect(adapter.compareDate(DateTime.local(2017, JAN, 2), DateTime.local(2017, JAN, 1)))
        .toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(adapter.clampDate(
        DateTime.local(2017, JAN, 1), DateTime.local(2018, JAN, 1), DateTime.local(2019, JAN, 1)))
        .toEqual(DateTime.local(2018, JAN, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(adapter.clampDate(
        DateTime.local(2020, JAN, 1), DateTime.local(2018, JAN, 1), DateTime.local(2019, JAN, 1)))
        .toEqual(DateTime.local(2019, JAN, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(adapter.clampDate(
        DateTime.local(2018, FEB, 1), DateTime.local(2018, JAN, 1), DateTime.local(2019, JAN, 1)))
        .toEqual(DateTime.local(2018, FEB, 1));
  });

  it('should count today as a valid date instance', () => {
    let d = DateTime.local();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    let d = DateTime.fromMillis(NaN);
    expect(adapter.isValid(d)).toBe(false);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count a string as not a date instance', () => {
    let d = '1/1/2017';
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should count a Date as not a date instance', () => {
    let d = new Date();
    expect(adapter.isDateInstance(d)).toBe(false);
  });

  it('should create valid dates from valid ISO strings', () => {
    assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
    assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
    assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
    assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
    assertValidDate(adapter.deserialize('1/1/2017'), false);
    expect(adapter.deserialize('')).toBeNull();
    expect(adapter.deserialize(null)).toBeNull();
    assertValidDate(adapter.deserialize(new Date()), true);
    assertValidDate(adapter.deserialize(new Date(NaN)), false);
    assertValidDate(adapter.deserialize(DateTime.local()), true);
    assertValidDate(adapter.deserialize(DateTime.invalid('Not valid')), false);
  });

  it('returned dates should have correct locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.createDate(2017, JAN, 1).locale).toBe('ja-JP');
    expect(adapter.today().locale).toBe('ja-JP');
    expect(adapter.parse('1/1/2017', 'L/d/yyyy')!.locale).toBe('ja-JP');
    expect(adapter.addCalendarDays(DateTime.local(), 1).locale).toBe('ja-JP');
    expect(adapter.addCalendarMonths(DateTime.local(), 1).locale).toBe('ja-JP');
    expect(adapter.addCalendarYears(DateTime.local(), 1).locale).toBe('ja-JP');
  });

  it('should not change locale of DateTime passed as param', () => {
    const date = DateTime.local();
    const initialLocale = date.locale;
    expect(initialLocale).toBeTruthy();
    adapter.setLocale('ja-JP');
    adapter.getYear(date);
    adapter.getMonth(date);
    adapter.getDate(date);
    adapter.getDayOfWeek(date);
    adapter.getYearName(date);
    adapter.getNumDaysInMonth(date);
    adapter.clone(date);
    adapter.parse(date, 'LL/dd/yyyy');
    adapter.format(date, 'LL/dd/yyyy');
    adapter.addCalendarDays(date, 1);
    adapter.addCalendarMonths(date, 1);
    adapter.addCalendarYears(date, 1);
    adapter.toIso8601(date);
    adapter.isDateInstance(date);
    adapter.isValid(date);
    expect(date.locale).toBe(initialLocale);
  });

  it('should create invalid date', () => {
    assertValidDate(adapter.invalid(), false);
  });
});

describe('LuxonDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: LuxonDateAdapter;
  let platform: Platform;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'da-DK'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter, Platform], (d: LuxonDateAdapter, p: Platform) => {
    adapter = d;
    platform = p;
  }));

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    const date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');

    // Some browsers add extra invisible characters that we should strip before asserting.
    if (platform.EDGE || platform.TRIDENT) {
      // IE and Edge's format for Danish is slightly different.
      expect(stripDirectionalityCharacters(date)).toEqual('2. jan 2017');
    } else {
      expect(stripDirectionalityCharacters(date)).toEqual('2. jan. 2017');
    }
  });
});

describe('LuxonDateAdapter with LOCALE_ID override', () => {
  let adapter: LuxonDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [{provide: LOCALE_ID, useValue: 'fr-FR'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
    adapter = d;
  }));

  it('should take the default locale id from the LOCALE_ID injection token', () => {
    const date = adapter.format(DateTime.local(2017, JAN, 2), 'DD');

    // Some browsers add extra invisible characters that we should strip before asserting.
    expect(stripDirectionalityCharacters(date)).toEqual('2 janv. 2017');
  });
});

describe('LuxonDateAdapter with MAT_LUXON_DATE_ADAPTER_OPTIONS override', () => {
  let adapter: LuxonDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LuxonDateModule],
      providers: [{
        provide: MAT_LUXON_DATE_ADAPTER_OPTIONS,
        useValue: {useUtc: true}
      }]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
    adapter = d;
  }));

  describe('use UTC', () => {
    it('should create Luxon date in UTC', () => {
      // Use 0 since createDate takes 0-indexed months.
      expect(adapter.createDate(2017, 0, 5).toISO())
          .toBe(DateTime.utc(2017, JAN, 5).toISO());
    });

    it('should create today in UTC', () => {
      const today = adapter.today();
      expect(today.toISO()).toBe(today.toUTC().toISO());
    });

    it('should parse dates to UTC', () => {
      const date = adapter.parse('1/2/2017', 'LL/dd/yyyy')!;
      expect(date.toISO()).toBe(date.toUTC().toISO());
    });

    it('should return UTC date when deserializing', () => {
      const date = adapter.deserialize('1985-04-12T23:20:50.52Z')!;
      expect(date.toISO()).toBe(date.toUTC().toISO());
    });
  });

});

function stripDirectionalityCharacters(str: string) {
  return str.replace(/[\u200e\u200f]/g, '');
}
