/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';

/**
 * Internal component that creates an instance of the MDC notched-outline component.
 *
 * The component sets up the HTML structure and styles for the notched-outline. It provides
 * inputs to toggle the notch state and width.
 */
@Component({
  selector: 'div[matFormFieldNotchedOutline]',
  templateUrl: './notched-outline.html',
  host: {
    'class': 'mdc-notched-outline',
    // Besides updating the notch state through the MDC component, we toggle this class through
    // a host binding in order to ensure that the notched-outline renders correctly on the server.
    '[class.mdc-notched-outline--notched]': 'open',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatFormFieldNotchedOutline implements AfterViewInit {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _ngZone = inject(NgZone);

  /** Whether the notch should be opened. */
  @Input('matFormFieldNotchedOutlineOpen') open: boolean = false;

  @ViewChild('notch') _notch: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const element = this._elementRef.nativeElement;
    const label = element.querySelector<HTMLElement>('.mdc-floating-label');

    if (label) {
      element.classList.add('mdc-notched-outline--upgraded');

      if (typeof requestAnimationFrame === 'function') {
        label.style.transitionDuration = '0s';
        this._ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => (label.style.transitionDuration = ''));
        });
      }
    } else {
      element.classList.add('mdc-notched-outline--no-label');
    }
  }

  _setNotchWidth(labelWidth: number) {
    const notch = this._notch.nativeElement;

    if (!this.open || !labelWidth) {
      notch.style.width = '';
    } else {
      const NOTCH_ELEMENT_PADDING = 8;
      const NOTCH_ELEMENT_BORDER = 1;
      notch.style.width = `calc(${labelWidth}px * var(--mat-mdc-form-field-floating-label-scale, 0.75) + ${
        NOTCH_ELEMENT_PADDING + NOTCH_ELEMENT_BORDER
      }px)`;
    }
  }

  _setMaxWidth(prefixAndSuffixWidth: number) {
    // Set this only on the notch to avoid style recalculations in other parts of the form field.
    this._notch.nativeElement.style.setProperty(
      '--mat-form-field-notch-max-width',
      `calc(100% - ${prefixAndSuffixWidth}px)`,
    );
  }
}
