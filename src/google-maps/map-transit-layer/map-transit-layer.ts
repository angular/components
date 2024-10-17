/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" preserve="true" />

import {Directive, EventEmitter, NgZone, OnDestroy, OnInit, Output, inject} from '@angular/core';

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
  private _map = inject(GoogleMap);
  private _zone = inject(NgZone);

  /**
   * The underlying google.maps.TransitLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
   */
  transitLayer?: google.maps.TransitLayer;

  /** Event emitted when the transit layer is initialized. */
  @Output() readonly transitLayerInitialized: EventEmitter<google.maps.TransitLayer> =
    new EventEmitter<google.maps.TransitLayer>();

  ngOnInit(): void {
    if (this._map._isBrowser) {
      if (google.maps.TransitLayer && this._map.googleMap) {
        this._initialize(this._map.googleMap, google.maps.TransitLayer);
      } else {
        this._zone.runOutsideAngular(() => {
          Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
            ([map, lib]) => {
              this._initialize(map, (lib as google.maps.MapsLibrary).TransitLayer);
            },
          );
        });
      }
    }
  }

  private _initialize(map: google.maps.Map, layerConstructor: typeof google.maps.TransitLayer) {
    this._zone.runOutsideAngular(() => {
      this.transitLayer = new layerConstructor();
      this.transitLayerInitialized.emit(this.transitLayer);
      this._assertLayerInitialized();
      this.transitLayer.setMap(map);
    });
  }

  ngOnDestroy() {
    this.transitLayer?.setMap(null);
  }

  private _assertLayerInitialized(): asserts this is {transitLayer: google.maps.TransitLayer} {
    if (!this.transitLayer) {
      throw Error(
        'Cannot interact with a Google Map Transit Layer before it has been initialized. ' +
          'Please wait for the Transit Layer to load before trying to interact with it.',
      );
    }
  }
}
