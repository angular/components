/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" preserve="true" />

import {Directive, NgZone, OnDestroy, OnInit, inject} from '@angular/core';

import {GoogleMap} from './google-map/google-map';

@Directive({
  selector: 'map-base-layer',
  exportAs: 'mapBaseLayer',
})
export class MapBaseLayer implements OnInit, OnDestroy {
  protected readonly _map = inject(GoogleMap);
  protected readonly _ngZone = inject(NgZone);

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._ngZone.runOutsideAngular(() => {
        this._initializeObject();
      });
      this._assertInitialized();
      this._setMap();
    }
  }

  ngOnDestroy() {
    this._unsetMap();
  }

  private _assertInitialized() {
    if (!this._map.googleMap) {
      throw Error(
        'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.',
      );
    }
  }

  protected _initializeObject() {}
  protected _setMap() {}
  protected _unsetMap() {}
}
