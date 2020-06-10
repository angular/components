/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {Directive, NgZone, OnDestroy, OnInit} from '@angular/core';

import {GoogleMap} from '../google-map/google-map';

/**
 * Angular component that renders a Google Maps Transit Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
 */
@Directive({
  selector: 'map-transit-layer',
  exportAs: 'mapTransitLayer',
})
export class MapTransitLayer implements OnInit, OnDestroy {
  /**
   * The underlying google.maps.TransitLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
   */
  transitLayer?: google.maps.TransitLayer;

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      // Create the object outside the zone so its events don't trigger change detection.
      this._ngZone.runOutsideAngular(() => {
        this.transitLayer = new google.maps.TransitLayer();
      });
      this._assertInitialized();
      this.transitLayer.setMap(this._map.googleMap!);
    }
  }

  ngOnDestroy() {
    if (this.transitLayer) {
      this.transitLayer.setMap(null);
    }
  }

  private _assertInitialized(): asserts this is {transitLayer: google.maps.TransitLayer} {
    if (!this._map.googleMap) {
      throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.');
    }
    if (!this.transitLayer) {
      throw Error(
          'Cannot interact with a Google Map Transit Layer before it has been initialized. ' +
          'Please wait for the Transit Layer to load before trying to interact with it.');
    }
  }
}
