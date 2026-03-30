/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '../../button';
import {MATERIAL_ANIMATIONS, provideNativeDateAdapter} from '../../core';
import {MatDatepickerModule} from '../../datepicker';
import {MatDatepickerActionsHarness} from './datepicker-actions-harness';
import {MatDatepickerInputHarness} from './datepicker-input-harness';

describe('MatDatepickerActionsHarness', () => {
  let fixture: ComponentFixture<DatepickerActionsHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideNativeDateAdapter(),
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });

    fixture = TestBed.createComponent(DatepickerActionsHarnessTest);
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load datepicker actions harness', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    const actions = await loader.getAllHarnesses(MatDatepickerActionsHarness);
    expect(actions.length).toBe(1);
  });

  it('should be able to apply', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);
    const actions = await loader.getHarness(MatDatepickerActionsHarness);
    await actions.apply();
    expect(await input.isCalendarOpen()).toBe(false);
    expect(fixture.componentInstance.applied()).toBe(true);
  });

  it('should be able to cancel', async () => {
    const input = await loader.getHarness(MatDatepickerInputHarness);
    await input.openCalendar();
    expect(await input.isCalendarOpen()).toBe(true);
    const actions = await loader.getHarness(MatDatepickerActionsHarness);
    await actions.cancel();
    expect(await input.isCalendarOpen()).toBe(false);
    expect(fixture.componentInstance.applied()).toBe(false);
  });
});

@Component({
  template: `
    <input [matDatepicker]="picker">
    <mat-datepicker #picker>
      <mat-datepicker-actions>
        <button mat-button matDatepickerCancel>Cancel</button>
        <button mat-button matDatepickerApply (click)="applied.set(true)">Apply</button>
      </mat-datepicker-actions>
    </mat-datepicker>
  `,
  imports: [MatDatepickerModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class DatepickerActionsHarnessTest {
  applied = signal(false);
}
