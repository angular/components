import {SimpleDate} from './simple-date';


describe('SimpleDate', () => {
  it('can be created from native Date', () => {
    expect(SimpleDate.fromNativeDate(new Date(2017, 0, 1))).toEqual(new SimpleDate(2017, 0, 1));
  });

  it('can be converted to native Date', () => {
    expect(new SimpleDate(2017, 0, 1).toNativeDate()).toEqual(new Date(2017, 0, 1));
  });
});
