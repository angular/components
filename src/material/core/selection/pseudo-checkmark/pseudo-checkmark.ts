/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  Input,
  ChangeDetectionStrategy,
  Inject,
  Optional,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

export type MatPseudoCheckmarkState = 'unchecked' | 'checked';

/**
 * Component that shows a simplified checkmark without including any kind of "real" checkmark.
 * Meant to be used when the checkmark is purely decorative and a large number of them will be
 * included, such as for the options in a single-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `mat-primary .mat-pseudo-checkmark`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with `<mat-radio>` and should *not* be used if the user would directly
 * interact with the checkmark. The pseudo-checkmark should only be used as an implementation detail
 * of more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'mat-pseudo-checkmark',
  styleUrls: ['pseudo-checkmark.css'],
  template: '',
  host: {
    'class': 'mat-pseudo-checkmark',
    '[class.mat-pseudo-checkmark-checked]': 'state === "checked"',
    '[class.mat-pseudo-checkmark-disabled]': 'disabled',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
})
export class MatPseudoCheckmark {
  /** Display state of the checkbox. */
  @Input() state: MatPseudoCheckmarkState = 'unchecked';

  /** Whether the checkbox is disabled. */
  @Input() disabled: boolean = false;

  constructor(@Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {}
}
