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
import {MatSlideToggle} from './slide-toggle';

describe('MatSlideToggle Zone.js integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });

  it('should not throw an error when disabling while focused', () => {
    const fixture = TestBed.createComponent(SlideToggleWithModel);
    fixture.detectChanges();

    expect(() => {
      // Focus the button element because after disabling, the `blur` event should automatically
      // fire and not result in a changed after checked exception.
      fixture.nativeElement.querySelector('button').focus();
      fixture.detectChanges();

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();
    }).not.toThrow();
  });
});

@Component({
  template: `<mat-slide-toggle [(ngModel)]="modelValue" [disabled]="isDisabled"></mat-slide-toggle>`,
  imports: [MatSlideToggle, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SlideToggleWithModel {
  modelValue = false;
  isDisabled = false;
}
