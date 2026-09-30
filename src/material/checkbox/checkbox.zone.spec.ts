/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, provideZoneChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatCheckbox} from './checkbox';

describe('MatCheckbox Zone.js integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  it('should not throw an error when disabling while focused', () => {
    const fixture = TestBed.createComponent(CheckboxWithNgModel);
    fixture.detectChanges();

    expect(() => {
      // Focus the input element because after disabling, the `blur` event should automatically
      // fire and not result in a changed after checked exception.
      fixture.nativeElement.querySelector('input').focus();
      fixture.detectChanges();

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();
    }).not.toThrow();
  });
});

@Component({
  template: `<mat-checkbox [(ngModel)]="isGood" [disabled]="isDisabled">Be good</mat-checkbox>`,
  imports: [MatCheckbox, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class CheckboxWithNgModel {
  isGood = false;
  isDisabled = false;
}
