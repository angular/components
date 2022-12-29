import {TestBed} from '@angular/core/testing';
import {MatNativeDateModule} from '@angular/material/core';

import {JAN, FEB, MAR} from '../testing';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  DefaultMatCalendarRangeStrategy,
} from './date-range-selection-strategy';
import {DateRange} from './date-selection-model';

describe('DefaultMatCalendarRangeStrategy', () => {
  let strategy: DefaultMatCalendarRangeStrategy<Date>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatNativeDateModule],
      providers: [
        {provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: DefaultMatCalendarRangeStrategy},
      ],
    });

    strategy = TestBed.inject(
      MAT_DATE_RANGE_SELECTION_STRATEGY,
    ) as DefaultMatCalendarRangeStrategy<Date>;
  });

  describe('createDrag', () => {
    const initialRange = new DateRange(new Date(2017, FEB, 10), new Date(2017, FEB, 13));

    it('drags the range start', () => {
      const rangeStart = new Date(2017, FEB, 10);

      // Grow range.
      expect(strategy.createDrag(rangeStart, initialRange, new Date(2017, FEB, 9))).toEqual(
        new DateRange(new Date(2017, FEB, 9), new Date(2017, FEB, 13)),
      );
      expect(strategy.createDrag(rangeStart, initialRange, new Date(2016, JAN, 9))).toEqual(
        new DateRange(new Date(2016, JAN, 9), new Date(2017, FEB, 13)),
      );

      // Shrink range.
      expect(strategy.createDrag(rangeStart, initialRange, new Date(2017, FEB, 11))).toEqual(
        new DateRange(new Date(2017, FEB, 11), new Date(2017, FEB, 13)),
      );

      // Move range after end.
      expect(strategy.createDrag(rangeStart, initialRange, new Date(2017, FEB, 14))).toEqual(
        new DateRange(new Date(2017, FEB, 14), new Date(2017, FEB, 17)),
      );
      expect(strategy.createDrag(rangeStart, initialRange, new Date(2018, MAR, 14))).toEqual(
        new DateRange(new Date(2018, MAR, 14), new Date(2018, MAR, 17)),
      );
    });

    it('drags the range end', () => {
      const rangeEnd = new Date(2017, FEB, 13);

      // Grow range.
      expect(strategy.createDrag(rangeEnd, initialRange, new Date(2017, FEB, 14))).toEqual(
        new DateRange(new Date(2017, FEB, 10), new Date(2017, FEB, 14)),
      );
      expect(strategy.createDrag(rangeEnd, initialRange, new Date(2018, MAR, 14))).toEqual(
        new DateRange(new Date(2017, FEB, 10), new Date(2018, MAR, 14)),
      );

      // Shrink range.
      expect(strategy.createDrag(rangeEnd, initialRange, new Date(2017, FEB, 12))).toEqual(
        new DateRange(new Date(2017, FEB, 10), new Date(2017, FEB, 12)),
      );

      // Move range before start.
      expect(strategy.createDrag(rangeEnd, initialRange, new Date(2017, FEB, 9))).toEqual(
        new DateRange(new Date(2017, FEB, 6), new Date(2017, FEB, 9)),
      );
      expect(strategy.createDrag(rangeEnd, initialRange, new Date(2016, JAN, 9))).toEqual(
        new DateRange(new Date(2016, JAN, 6), new Date(2016, JAN, 9)),
      );
    });

    it('drags the range middle', () => {
      const rangeMiddle = new Date(2017, FEB, 11);

      // Move range earlier.
      expect(strategy.createDrag(rangeMiddle, initialRange, new Date(2017, FEB, 7))).toEqual(
        new DateRange(new Date(2017, FEB, 6), new Date(2017, FEB, 9)),
      );
      expect(strategy.createDrag(rangeMiddle, initialRange, new Date(2016, JAN, 7))).toEqual(
        new DateRange(new Date(2016, JAN, 6), new Date(2016, JAN, 9)),
      );

      // Move range later.
      expect(strategy.createDrag(rangeMiddle, initialRange, new Date(2017, FEB, 15))).toEqual(
        new DateRange(new Date(2017, FEB, 14), new Date(2017, FEB, 17)),
      );
      expect(strategy.createDrag(rangeMiddle, initialRange, new Date(2018, MAR, 15))).toEqual(
        new DateRange(new Date(2018, MAR, 14), new Date(2018, MAR, 17)),
      );
    });
  });
});
