/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {contentChild, Directive, inject} from '@angular/core';
import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';

@Directive({
  selector: '[cdkCombobox]',
  exportAs: 'cdkCombobox',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
})
export class CdkCombobox {
  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The combobox popup. */
  readonly popup = contentChild(CdkComboboxPopup);

  constructor() {
    this._deferredContentAware?.contentVisible.set(true);
  }
}

@Directive({
  selector: 'input[cdkComboboxInput]',
  exportAs: 'cdkComboboxInput',
  host: {'role': 'combobox'},
})
export class CdkComboboxInput {}

@Directive({
  selector: 'ng-template[cdkComboboxPopupContent]',
  exportAs: 'cdkComboboxPopupContent',
  hostDirectives: [DeferredContent],
})
export class CdkComboboxPopupContent {}

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
})
export class CdkComboboxPopup {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject(CdkCombobox, {optional: true});
}
