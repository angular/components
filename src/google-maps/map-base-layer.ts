/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Directive, NgZone, OnDestroy, OnInit} from '@angular/core';

import {GoogleMap} from './google-map/google-map';

@Directive({
  selector: 'map-base-layer',
  exportAs: 'mapBaseLayer',
  standalone: true,
})
export class MapBaseLayer implements OnInit, OnDestroy {
  constructor(
    protected readonly _map: GoogleMap,
    protected readonly _ngZone: NgZone,
  ) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._ngZone.runOutsideAngular(async () => {
        const map = await this._map._resolveMap();
        await this._initializeObject();
        this._setMap(map);
      });
    }
  }

  ngOnDestroy() {
    this._unsetMap();
  }

  protected async _initializeObject() {}
  protected _setMap(_map: google.maps.Map) {}
  protected _unsetMap() {}
}
