import {inject, TestBed, async} from '@angular/core/testing';
import {CalendarLocale} from './calendar-locale';
import {DatetimeModule} from './index';
import {SimpleDate} from './simple-date';


describe('DefaultCalendarLocale', () => {
  let calendarLocale: CalendarLocale;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DatetimeModule],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([CalendarLocale], (cl: CalendarLocale) => {
    calendarLocale = cl;
  }));

  it('lists months', () => {
    expect(calendarLocale.months).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'
    ]);
  });

  it('lists short months', () => {
    expect(calendarLocale.shortMonths).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
  });

  it('lists narrow months', () => {
    expect(calendarLocale.narrowMonths).toEqual([
      'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
    ]);
  });

  it('lists days', () => {
    expect(calendarLocale.days).toEqual([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]);
  });

  it('lists short days', () => {
    expect(calendarLocale.shortDays).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('lists narrow days', () => {
    expect(calendarLocale.narrowDays).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  it('lists dates', () => {
    expect(calendarLocale.dates).toEqual([
      null, '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
      '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('has first day of the week', () => {
    expect(calendarLocale.firstDayOfWeek).toBe(0);
  });

  it('has calendar label', () => {
    expect(calendarLocale.calendarLabel).toBe('Calendar');
  });

  it('has open calendar label', () => {
    expect(calendarLocale.openCalendarLabel).toBe('Open calendar');
  });

  it('parses SimpleDate from string', () => {
    expect(calendarLocale.parseDate('1/1/2017')).toEqual(new SimpleDate(2017, 0, 1));
  });

  it('parses SimpleDate from number', () => {
    let timestamp = new Date().getTime();
    expect(calendarLocale.parseDate(timestamp))
        .toEqual(SimpleDate.fromNativeDate(new Date(timestamp)));
  });

  it ('parses SimpleDate from SimpleDate by copying', () => {
    let originalSimpleDate = new SimpleDate(2017, 0, 1);
    expect(calendarLocale.parseDate(originalSimpleDate)).toEqual(originalSimpleDate);
  });

  it('parses null for invalid dates', () => {
    expect(calendarLocale.parseDate('hello')).toBeNull();
  });

  it('formats SimpleDates', () => {
    expect(calendarLocale.formatDate(new SimpleDate(2017, 0, 1))).toEqual('1/1/2017');
  });

  it('gets header label for calendar month', () => {
    expect(calendarLocale.getCalendarMonthHeaderLabel(new SimpleDate(2017, 0, 1)))
        .toEqual('Jan 2017');
  });

  it('gets header label for calendar year', () => {
    expect(calendarLocale.getCalendarYearHeaderLabel(new SimpleDate(2017, 0, 1))).toBe('2017');
  });
});
