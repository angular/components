/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {Directive, OnDestroy} from '@angular/core';
import {CdkMenuItemSelectable} from './menu-item-selectable';

/**
 * A directive providing RadioButton functionality for the MenuBar/Menu. If the element this
 * directive is attached to is located within a Menu or MenuGroup, it's siblings are now part of the
 * same RadioGroup and will behave as such.
 */
@Directive({
  selector: '[cdkMenuItemRadio]',
  exportAs: 'cdkMenuItemRadio',
  host: {
    '(click)': 'trigger()',
    'type': 'button',
    'role': 'menuitemradio',
    '[attr.aria-checked]': 'checked',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [{provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio}],
})
export class CdkMenuItemRadio extends CdkMenuItemSelectable implements OnDestroy {
  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener: () => void;

  constructor(private readonly _selectionDispatcher: UniqueSelectionDispatcher) {
    super();

    this._registerDispatcherListener();
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen(
      (id: string, name: string) => (this.checked = this.id === id && this.name === name)
    );
  }

  /** Inform the Radio Group of a click event */
  trigger() {
    super.trigger();

    if (!this.disabled) {
      this._selectionDispatcher.notify(this.id, this.name);
    }
  }

  ngOnDestroy() {
    this._removeDispatcherListener();
  }
}
