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
 * Angular component that renders a Google Maps Bicycling Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
 */
@Directive({
  selector: 'map-bicycling-layer',
  exportAs: 'mapBicyclingLayer',
})
export class MapBicyclingLayer implements OnInit, OnDestroy {
  /**
   * The underlying google.maps.BicyclingLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
   */
  bicyclingLayer?: google.maps.BicyclingLayer;

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      // Create the object outside the zone so its events don't trigger change detection.
      this._ngZone.runOutsideAngular(() => {
        this.bicyclingLayer = new google.maps.BicyclingLayer();
      });
      this._assertInitialized();
      this.bicyclingLayer.setMap(this._map.googleMap!);
    }
  }

  ngOnDestroy() {
    if (this.bicyclingLayer) {
      this.bicyclingLayer.setMap(null);
    }
  }

  private _assertInitialized(): asserts this is {bicyclingLayer: google.maps.BicyclingLayer} {
    if (!this._map.googleMap) {
      throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.');
    }
    if (!this.bicyclingLayer) {
      throw Error(
          'Cannot interact with a Google Map Bicycling Layer before it has been initialized. ' +
          'Please wait for the Bicycling Layer to load before trying to interact with it.');
    }
  }
}
