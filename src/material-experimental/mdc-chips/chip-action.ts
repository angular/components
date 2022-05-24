/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Input} from '@angular/core';
import {
  CanDisable,
  HasTabIndex,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material-experimental/mdc-core';

const _MatChipActionMixinBase = mixinTabIndex(mixinDisabled(class {}), -1);

/**
 * Section within a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipAction]',
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'mdc-evolution-chip__action mat-mdc-chip-action',
    '[class.mdc-evolution-chip__action--primary]': '_isPrimary',
    // Note that while our actions are interactive, we have to add the `--presentational` class,
    // in order to avoid some super-specific `:hover` styles from MDC.
    '[class.mdc-evolution-chip__action--presentational]': '_isPrimary',
    '[class.mdc-evolution-chip__action--trailing]': '!_isPrimary',
    '[attr.tabindex]': '(disabled || !isInteractive) ? null : tabIndex',
    '[attr.disabled]': "disabled ? '' : null",
    '[attr.aria-disabled]': 'disabled',
  },
})
export class MatChipAction extends _MatChipActionMixinBase implements CanDisable, HasTabIndex {
  /** Whether the action is interactive. */
  @Input() isInteractive = true;

  /** Whether this is the primary action in the chip. */
  _isPrimary = true;

  constructor(public _elementRef: ElementRef<HTMLElement>) {
    super();

    if (_elementRef.nativeElement.nodeName === 'BUTTON') {
      _elementRef.nativeElement.setAttribute('type', 'button');
    }
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
