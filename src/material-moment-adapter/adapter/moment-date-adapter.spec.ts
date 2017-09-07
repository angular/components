/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MomentDateAdapter} from './moment-date-adapter';
import {async, inject, TestBed} from '@angular/core/testing';
import {MomentDateModule} from './index';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material';
import moment from 'moment';
import {LOCALE_ID} from '@angular/core';


// Month constants for more readable tests.
const JAN = 0, FEB = 1, MAR = 2, DEC = 11;


// Add some locales for testing. These definitions come from Moment.js's fr.js and ja.js locale
// files. (We don't want to the version of moment that comes with locales because it's a lot of
// extra bytes to include in our tests.)
moment.defineLocale('fr', {
  months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'
      .split('_'),
  monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
  monthsParseExact: true,
  weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
  weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
  weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
  weekdaysParseExact: true,
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY HH:mm'
  },
  calendar: {
    sameDay: '[Aujourd’hui à] LT',
    nextDay: '[Demain à] LT',
    nextWeek: 'dddd [à] LT',
    lastDay: '[Hier à] LT',
    lastWeek: 'dddd [dernier à] LT',
    sameElse: 'L'
  },
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    s: 'quelques secondes',
    m: 'une minute',
    mm: '%d minutes',
    h: 'une heure',
    hh: '%d heures',
    d: 'un jour',
    dd: '%d jours',
    M: 'un mois',
    MM: '%d mois',
    y: 'un an',
    yy: '%d ans'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(er|)/,
  // tslint:disable-next-line:variable-name
  ordinal: function (number, period) {
    switch (period) {
        // TODO: Return 'e' when day of month > 1. Move this case inside
        // block for masculine words below.
        // See https://github.com/moment/moment/issues/3375
      case 'D':
        return number + (number === 1 ? 'er' : '');

        // Words with masculine grammatical gender: mois, trimestre, jour
      default:
      case 'M':
      case 'Q':
      case 'DDD':
      case 'd':
        return number + (number === 1 ? 'er' : 'e');

        // Words with feminine grammatical gender: semaine
      case 'w':
      case 'W':
        return number + (number === 1 ? 're' : 'e');
    }
  },
  week: {
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  }
} as any);

moment.defineLocale('ja', {
  months: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
  weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
  weekdaysMin: '日_月_火_水_木_金_土'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY/MM/DD',
    LL: 'YYYY年M月D日',
    LLL: 'YYYY年M月D日 HH:mm',
    LLLL: 'YYYY年M月D日 HH:mm dddd',
    l: 'YYYY/MM/DD',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日 HH:mm dddd'
  },
  meridiemParse: /午前|午後/i,
  isPM: function (input) {
    return input === '午後';
  },
  meridiem: function (hour) {
    if (hour < 12) {
      return '午前';
    } else {
      return '午後';
    }
  },
  calendar: {
    sameDay: '[今日] LT',
    nextDay: '[明日] LT',
    nextWeek: '[来週]dddd LT',
    lastDay: '[昨日] LT',
    lastWeek: '[前週]dddd LT',
    sameElse: 'L'
  },
  dayOfMonthOrdinalParse: /\d{1,2}日/,
  // tslint:disable-next-line:variable-name
  ordinal: function (number, period) {
    switch (period) {
      case 'd':
      case 'D':
      case 'DDD':
        return number + '日';
      default:
        return number;
    }
  },
  relativeTime: {
    future: '%s後',
    past: '%s前',
    s: '数秒',
    m: '1分',
    mm: '%d分',
    h: '1時間',
    hh: '%d時間',
    d: '1日',
    dd: '%d日',
    M: '1ヶ月',
    MM: '%dヶ月',
    y: '1年',
    yy: '%d年'
  }
} as any);

moment.locale('en');


describe('MomentDateAdapter', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
    adapter.setLocale('en');
  }));

  it('should get year', () => {
    expect(adapter.getYear(moment([2017,  JAN,  1]))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(moment([2017,  JAN,  1]))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(moment([2017,  JAN,  1]))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
  });

  it('should get same day of week in a locale with a different first day of the week', () => {
    adapter.setLocale('fr');
    expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
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
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
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
    expect(adapter.getDayOfWeekNames('narrow')).toEqual([
      'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
    ]);
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
    ]);
  });

  it('should get year name', () => {
    expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('2017');
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should get first day of week in a different locale', () => {
    adapter.setLocale('fr');
    expect(adapter.getFirstDayOfWeek()).toBe(1);
  });

  it('should create Moment date', () => {
    expect(adapter.createDate(2017, JAN, 1).format()).toEqual(moment([2017,  JAN,  1]).format());
  });

  it('should not create Moment date with month over/under-flow', () => {
    expect(() => adapter.createDate(2017, DEC + 1, 1)).toThrow();
    expect(() => adapter.createDate(2017, JAN - 1, 1)).toThrow();
  });

  it('should not create Moment date with date over/under-flow', () => {
    expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
    expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
  });

  it('should create Moment date with low year number', () => {
    expect(adapter.createDate(-1, JAN, 1).year()).toBe(-1);
    expect(adapter.createDate(0, JAN, 1).year()).toBe(0);
    expect(adapter.createDate(50, JAN, 1).year()).toBe(50);
    expect(adapter.createDate(99, JAN, 1).year()).toBe(99);
    expect(adapter.createDate(100, JAN, 1).year()).toBe(100);
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), moment()))
        .toBe(true, "should be equal to today's date");
  });

  it('should parse string according to given format', () => {
    expect(adapter.parse('1/2/2017', 'MM/DD/YYYY')!.format())
        .toEqual(moment([2017,  JAN,  2]).format());
    expect(adapter.parse('1/2/2017', 'DD/MM/YYYY')!.format())
        .toEqual(moment([2017,  FEB,  1]).format());
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp, 'MM/DD/YYYY')!.format()).toEqual(moment(timestamp).format());
  });

  it ('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date, 'MM/DD/YYYY')!.format()).toEqual(moment(date).format());
  });

  it ('should parse Moment date', () => {
    let date = moment([2017,  JAN,  1]);
    let parsedDate = adapter.parse(date, 'MM/DD/YYYY');
    expect(parsedDate!.format()).toEqual(date.format());
    expect(parsedDate).not.toBe(date);
  });

  it('should parse empty string as null', () => {
    expect(adapter.parse('', 'MM/DD/YYYY')).toBeNull();
  });

  it('should parse invalid value as invalid', () => {
    let d = adapter.parse('hello', 'MM/DD/YYYY');
    expect(d).not.toBeNull();
    expect(adapter.isDateInstance(d))
        .toBe(true, 'Expected string to have been fed through Date.parse');
    expect(adapter.isValid(d as moment.Moment))
        .toBe(false, 'Expected to parse as "invalid date" object');
  });

  it('should format date according to given format', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'MM/DD/YYYY')).toEqual('01/02/2017');
    expect(adapter.format(moment([2017,  JAN,  2]), 'DD/MM/YYYY')).toEqual('02/01/2017');
  });

  it('should format with a different locale', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('Jan 2, 2017');
    adapter.setLocale('ja-JP');
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
  });

  it('should throw when attempting to format invalid date', () => {
    expect(() => adapter.format(moment(NaN), 'MM/DD/YYYY'))
        .toThrowError(/MomentDateAdapter: Cannot format invalid date\./);
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2018, JAN, 1]).format());
    expect(adapter.addCalendarYears(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, JAN, 1]).format());
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(moment([2016, FEB, 29]), 1).format())
        .toEqual(moment([2017, FEB, 28]).format());
    expect(adapter.addCalendarYears(moment([2016, FEB, 29]), -1).format())
        .toEqual(moment([2015, FEB, 28]).format());
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2017, FEB, 1]).format());
    expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, DEC, 1]).format());
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(moment([2017, JAN, 31]), 1).format())
        .toEqual(moment([2017, FEB, 28]).format());
    expect(adapter.addCalendarMonths(moment([2017, MAR, 31]), -1).format())
        .toEqual(moment([2017, FEB, 28]).format());
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(moment([2017, JAN, 1]), 1).format())
        .toEqual(moment([2017, JAN, 2]).format());
    expect(adapter.addCalendarDays(moment([2017, JAN, 1]), -1).format())
        .toEqual(moment([2016, DEC, 31]).format());
  });

  it('should clone', () => {
    let date = moment([2017, JAN, 1]);
    expect(adapter.clone(date).format()).toEqual(date.format());
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 2]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, FEB, 1]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2018, JAN, 1]))).toBeLessThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 1]))).toBe(0);
    expect(adapter.compareDate(moment([2018, JAN, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
    expect(adapter.compareDate(moment([2017, FEB, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
    expect(adapter.compareDate(moment([2017, JAN, 2]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(adapter.clampDate(
        moment([2017, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2018, JAN, 1]));
  });

  it('should clamp date at upper bound', () => {
    expect(adapter.clampDate(
        moment([2020, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2019, JAN, 1]));
  });

  it('should clamp date already within bounds', () => {
    expect(adapter.clampDate(
        moment([2018, FEB, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
        .toEqual(moment([2018, FEB, 1]));
  });

  it('should count today as a valid date instance', () => {
    let d = moment();
    expect(adapter.isValid(d)).toBe(true);
    expect(adapter.isDateInstance(d)).toBe(true);
  });

  it('should count an invalid date as an invalid date instance', () => {
    let d = moment(NaN);
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

  it('setLocale should not modify global moment locale', () => {
    expect(moment.locale()).toBe('en');
    adapter.setLocale('ja-JP');
    expect(moment.locale()).toBe('en');
  });

  it('returned Moments should have correct locale', () => {
    adapter.setLocale('ja-JP');
    expect(adapter.createDate(2017, JAN, 1).locale()).toBe('ja');
    expect(adapter.today().locale()).toBe('ja');
    expect(adapter.clone(moment()).locale()).toBe('ja');
    expect(adapter.parse('1/1/2017', 'MM/DD/YYYY')!.locale()).toBe('ja');
    expect(adapter.addCalendarDays(moment(), 1).locale()).toBe('ja');
    expect(adapter.addCalendarMonths(moment(), 1).locale()).toBe('ja');
    expect(adapter.addCalendarYears(moment(), 1).locale()).toBe('ja');
  });

  it('should not change locale of Moments passed as params', () => {
    let date = moment();
    expect(date.locale()).toBe('en');
    adapter.setLocale('ja-JP');
    adapter.getYear(date);
    adapter.getMonth(date);
    adapter.getDate(date);
    adapter.getDayOfWeek(date);
    adapter.getYearName(date);
    adapter.getNumDaysInMonth(date);
    adapter.clone(date);
    adapter.parse(date, 'MM/DD/YYYY');
    adapter.format(date, 'MM/DD/YYYY');
    adapter.addCalendarDays(date, 1);
    adapter.addCalendarMonths(date, 1);
    adapter.addCalendarYears(date, 1);
    adapter.getISODateString(date);
    adapter.isDateInstance(date);
    adapter.isValid(date);
    expect(date.locale()).toBe('en');
  });
});

describe('MomentDateAdapter with MAT_DATE_LOCALE override', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule],
      providers: [{provide: MAT_DATE_LOCALE, useValue: 'ja-JP'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
  }));

  it('should take the default locale id from the MAT_DATE_LOCALE injection token', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
  });
});

describe('MomentDateAdapter with LOCALE_ID override', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule],
      providers: [{provide: LOCALE_ID, useValue: 'fr'}]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
  }));

  it('should take the default locale id from the LOCALE_ID injection token', () => {
    expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2 janv. 2017');
  });
});
