import {SimpleDate} from './simple-date';


describe('SimpleDate', () => {
  it('can be created from native Date', () => {
    expect(SimpleDate.fromNativeDate(new Date(2017, 0, 1))).toEqual(new SimpleDate(2017, 0, 1));
  });

  it('can be converted to native Date', () => {
    expect(new SimpleDate(2017, 0, 1).toNativeDate()).toEqual(new Date(2017, 0, 1));
  });

  it('handles month and date overflow', () => {
    expect(new SimpleDate(2017, 12, 32)).toEqual(new SimpleDate(2018, 1, 1));
  });

  it('handles month and date underflow', () => {
    expect(new SimpleDate(2017, -1, 0)).toEqual(new SimpleDate(2016, 10, 30));
  });

  it('handles low year numbers', () => {
    expect(new SimpleDate(-1, 0, 1).year).toBe(-1);
    expect(new SimpleDate(0, 0, 1).year).toBe(0);
    expect(new SimpleDate(50, 0, 1).year).toBe(50);
    expect(new SimpleDate(99, 0, 1).year).toBe(99);
    expect(new SimpleDate(100, 0, 1).year).toBe(100);
  });

  it('handles low year number with over/under-flow', () => {
    expect(new SimpleDate(50, 12 * 51, 1).year).toBe(101);
    expect(new SimpleDate(50, 12, 1).year).toBe(51);
    expect(new SimpleDate(50, -12, 1).year).toBe(49);
    expect(new SimpleDate(50, -12 * 51, 1).year).toBe(-1);
  });

  it('adds years, months, and days', () => {
    expect(new SimpleDate(2017, 0, 1).add({years: 1, months: 1, days: 1}))
        .toEqual(new SimpleDate(2018, 1, 2));
  });

  it('clamps date at lower bound', () => {
    let date = new SimpleDate(2017, 0, 1);
    let lower = new SimpleDate(2018, 1, 2);
    let upper = new SimpleDate(2019, 2, 3);
    expect(date.clamp(lower, upper)).toEqual(lower);
  });

  it('clamps date at upper bound', () => {
    let date = new SimpleDate(2020, 0, 1);
    let lower = new SimpleDate(2018, 1, 2);
    let upper = new SimpleDate(2019, 2, 3);
    expect(date.clamp(lower, upper)).toEqual(upper);
  });

  it('clamp treats null as unbounded', () => {
    let date = new SimpleDate(2017, 0, 1);
    expect(date.clamp(null, null)).toEqual(date);
  });
});
