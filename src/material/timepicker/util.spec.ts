import {TestBed} from '@angular/core/testing';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {generateOptions, parseInterval} from './util';

describe('timepicker utilities', () => {
  describe('parseInterval', () => {
    it('should parse null', () => {
      expect(parseInterval(null)).toBe(null);
    });

    it('should parse a number', () => {
      expect(parseInterval(75)).toBe(75);
    });

    it('should parse a number in a string', () => {
      expect(parseInterval('75')).toBe(75);
      expect(parseInterval('75.50')).toBe(75.5);
    });

    it('should handle invalid strings', () => {
      expect(parseInterval('')).toBe(null);
      expect(parseInterval('     ')).toBe(null);
      expect(parseInterval('abc')).toBe(null);
      expect(parseInterval('1a')).toBe(null);
      expect(parseInterval('m1')).toBe(null);
      expect(parseInterval('10.')).toBe(null);
    });

    it('should parse hours', () => {
      expect(parseInterval('3h')).toBe(10_800);
      expect(parseInterval('4.5h')).toBe(16_200);
      expect(parseInterval('11h')).toBe(39_600);
    });

    it('should parse minutes', () => {
      expect(parseInterval('3m')).toBe(180);
      expect(parseInterval('7.5m')).toBe(450);
      expect(parseInterval('90m')).toBe(5_400);
      expect(parseInterval('100.5m')).toBe(6_030);
    });

    it('should parse seconds', () => {
      expect(parseInterval('3s')).toBe(3);
      expect(parseInterval('7.5s')).toBe(7.5);
      expect(parseInterval('90s')).toBe(90);
      expect(parseInterval('100.5s')).toBe(100.5);
    });

    it('should parse uppercase units', () => {
      expect(parseInterval('3H')).toBe(10_800);
      expect(parseInterval('3M')).toBe(180);
      expect(parseInterval('3S')).toBe(3);
    });
  });

  describe('generateOptions', () => {
    let adapter: DateAdapter<Date>;
    let formats: MatDateFormats;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideNativeDateAdapter()]});
      adapter = TestBed.inject(DateAdapter);
      formats = TestBed.inject(MAT_DATE_FORMATS);
      adapter.setLocale('en-US');
    });

    it('should generate a list of options', () => {
      const min = new Date(2024, 0, 1, 9, 0, 0, 0);
      const max = new Date(2024, 0, 1, 22, 0, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 3600).map(o => o.label);
      expect(options).toEqual([
        '9:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '1:00 PM',
        '2:00 PM',
        '3:00 PM',
        '4:00 PM',
        '5:00 PM',
        '6:00 PM',
        '7:00 PM',
        '8:00 PM',
        '9:00 PM',
        '10:00 PM',
      ]);
    });

    it('should generate a list of options with a sub-hour interval', () => {
      const min = new Date(2024, 0, 1, 9, 0, 0, 0);
      const max = new Date(2024, 0, 1, 22, 0, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 43 * 60).map(o => o.label);
      expect(options).toEqual([
        '9:00 AM',
        '9:43 AM',
        '10:26 AM',
        '11:09 AM',
        '11:52 AM',
        '12:35 PM',
        '1:18 PM',
        '2:01 PM',
        '2:44 PM',
        '3:27 PM',
        '4:10 PM',
        '4:53 PM',
        '5:36 PM',
        '6:19 PM',
        '7:02 PM',
        '7:45 PM',
        '8:28 PM',
        '9:11 PM',
        '9:54 PM',
      ]);
    });

    it('should generate a list of options with a minute interval', () => {
      const min = new Date(2024, 0, 1, 9, 0, 0, 0);
      const max = new Date(2024, 0, 1, 9, 16, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 60).map(o => o.label);
      expect(options).toEqual([
        '9:00 AM',
        '9:01 AM',
        '9:02 AM',
        '9:03 AM',
        '9:04 AM',
        '9:05 AM',
        '9:06 AM',
        '9:07 AM',
        '9:08 AM',
        '9:09 AM',
        '9:10 AM',
        '9:11 AM',
        '9:12 AM',
        '9:13 AM',
        '9:14 AM',
        '9:15 AM',
        '9:16 AM',
      ]);
    });

    it('should generate a list of options with a sub-minute interval', () => {
      const previousFormat = formats.display.timeOptionLabel;
      formats.display.timeOptionLabel = {hour: 'numeric', minute: 'numeric', second: 'numeric'};
      const min = new Date(2024, 0, 1, 9, 0, 0, 0);
      const max = new Date(2024, 0, 1, 9, 3, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 12).map(o => o.label);
      expect(options).toEqual([
        '9:00:00 AM',
        '9:00:12 AM',
        '9:00:24 AM',
        '9:00:36 AM',
        '9:00:48 AM',
        '9:01:00 AM',
        '9:01:12 AM',
        '9:01:24 AM',
        '9:01:36 AM',
        '9:01:48 AM',
        '9:02:00 AM',
        '9:02:12 AM',
        '9:02:24 AM',
        '9:02:36 AM',
        '9:02:48 AM',
        '9:03:00 AM',
      ]);
      formats.display.timeOptionLabel = previousFormat;
    });

    it('should generate at least one option if the interval is too large', () => {
      const min = new Date(2024, 0, 1, 0, 0, 0, 0);
      const max = new Date(2024, 0, 1, 23, 59, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 60 * 60 * 24).map(o => o.label);
      expect(options).toEqual(['12:00 AM']);
    });

    it('should generate at least one option if the max is later than the min', () => {
      const min = new Date(2024, 0, 1, 23, 0, 0, 0);
      const max = new Date(2024, 0, 1, 13, 0, 0, 0);
      const options = generateOptions(adapter, formats, min, max, 3600).map(o => o.label);
      expect(options).toEqual(['1:00 PM']);
    });
  });
});
