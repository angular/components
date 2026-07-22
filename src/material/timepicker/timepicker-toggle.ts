/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  ViewEncapsulation,
} from '@angular/core';
import {MatIconButton} from '../button';
import {MAT_TIMEPICKER_CONFIG} from './util';
import type {MatTimepicker} from './timepicker';

/** Button that can be used to open a `mat-timepicker`. */
@Component({
  selector: 'mat-timepicker-toggle',
  templateUrl: 'timepicker-toggle.html',
  host: {
    'class': 'mat-timepicker-toggle',
    '[attr.tabindex]': 'null',
    // Bind the `click` on the host, rather than the inner `button`, so that we can call
    // `stopPropagation` on it without affecting the user's `click` handlers. We need to stop
    // it so that the input doesn't get focused automatically by the form field (See #21836).
    '(click)': '_open($event)',
  },
  exportAs: 'matTimepickerToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconButton],
})
export class MatTimepickerToggle<D> {
  private _defaultConfig = inject(MAT_TIMEPICKER_CONFIG, {optional: true});
  private _defaultTabIndex = (() => {
    const value = inject(new HostAttributeToken('tabindex'), {optional: true});
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  })();

  protected _isDisabled = computed(() => {
    const timepicker = this.timepicker();
    return this.disabled() || timepicker.disabled();
  });

  /** Timepicker instance that the button will toggle. */
  readonly timepicker: InputSignal<MatTimepicker<D>> = input.required<MatTimepicker<D>>({
    alias: 'for',
  });

  /** Screen-reader label for the button. */
  readonly ariaLabel = input<string | undefined>(undefined, {
    alias: 'aria-label',
  });

  /** Screen-reader labelled by id for the button. */
  readonly ariaLabelledby = input<string | undefined>(undefined, {
    alias: 'aria-labelledby',
  });

  /** Default aria-label for the toggle if none is provided. */
  private readonly _defaultAriaLabel = 'Open timepicker options';

  /** Whether the toggle button is disabled. */
  readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
    alias: 'disabled',
  });

  /** Tabindex for the toggle. */
  readonly tabIndex: InputSignal<number | null> = input(this._defaultTabIndex);

  /** Whether ripples on the toggle should be disabled. */
  readonly disableRipple: InputSignalWithTransform<boolean, unknown> = input(
    this._defaultConfig?.disableRipple ?? false,
    {transform: booleanAttribute},
  );

  /** Opens the connected timepicker. */
  protected _open(event: Event): void {
    if (this.timepicker() && !this._isDisabled()) {
      this.timepicker().open();
      event.stopPropagation();
    }
  }

  /**
   * Checks for ariaLabelledby and if empty uses custom
   * aria-label or defaultAriaLabel if neither is provided.
   */
  getAriaLabel(): string | null {
    return this.ariaLabelledby() ? null : this.ariaLabel() || this._defaultAriaLabel;
  }
}
