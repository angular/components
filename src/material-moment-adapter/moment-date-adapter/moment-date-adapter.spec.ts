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
import {DateAdapter} from '@angular/material';
import * as moment from 'moment';


const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
    NOV = 10, DEC = 11;


fdescribe('MomentDateAdapter', () => {
  let adapter: MomentDateAdapter;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MomentDateModule]
    }).compileComponents();
  }));

  beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
    adapter = d;
  }));

  it('should get year', () => {
    expect(adapter.getYear(moment({y: 2017, m: JAN, d: 1}))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(moment({y: 2017, m: JAN, d: 1}))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(moment({y: 2017, m: JAN, d: 1}))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(moment({y: 2017, m: JAN, d: 1}))).toBe(0);
  });
});
