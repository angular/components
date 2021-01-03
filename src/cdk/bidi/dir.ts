/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, AfterContentInit} from '@angular/core';
import {Directionality} from './directionality';

/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Provides itself as Directionality such that descendant directives only need to ever inject
 * Directionality to get the closest direction.
 */
@Directive({
  selector: '[dir]',
  providers: [{provide: Directionality, useExisting: Dir}],
  inputs: ['dir'],
  outputs: ['change: dirChange'],
  host: {'[attr.dir]': '_rawDir'},
  exportAs: 'dir',
})
export class Dir extends Directionality implements AfterContentInit {
  constructor() {
    super();

    // Reset the initialized flag here so that we don't emit the `change` event
    // immediately. We'll turn it on again once the content is initialized.
    this._isInitialized = false;
  }

  /** Initialize once default value has been set. */
  ngAfterContentInit() {
    this._isInitialized = true;
  }
}

