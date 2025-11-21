/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, EventEmitter, NgZone, OnDestroy, OnInit, Output, inject} from '@angular/core';

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
  private _map = inject(GoogleMap);
  private _zone = inject(NgZone);

  /**
   * The underlying google.maps.BicyclingLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
   */
  bicyclingLayer?: google.maps.BicyclingLayer;

  /** Event emitted when the bicycling layer is initialized. */
  @Output() readonly bicyclingLayerInitialized: EventEmitter<google.maps.BicyclingLayer> =
    new EventEmitter<google.maps.BicyclingLayer>();

  ngOnInit(): void {
    if (this._map._isBrowser) {
      if (google.maps.BicyclingLayer && this._map.googleMap) {
        this._initialize(this._map.googleMap, google.maps.BicyclingLayer);
      } else {
        this._zone.runOutsideAngular(() => {
          Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
            ([map, lib]) => {
              this._initialize(map, (lib as google.maps.MapsLibrary).BicyclingLayer);
            },
          );
        });
      }
    }
  }

  private _initialize(map: google.maps.Map, layerConstructor: typeof google.maps.BicyclingLayer) {
    this._zone.runOutsideAngular(() => {
      this.bicyclingLayer = new layerConstructor();
      this.bicyclingLayerInitialized.emit(this.bicyclingLayer);
      this._assertLayerInitialized();
      this.bicyclingLayer.setMap(map);
    });
  }

  ngOnDestroy() {
    this.bicyclingLayer?.setMap(null);
  }

  private _assertLayerInitialized(): asserts this is {bicyclingLayer: google.maps.BicyclingLayer} {
    if (!this.bicyclingLayer) {
      throw Error(
        'Cannot interact with a Google Map Bicycling Layer before it has been initialized. ' +
          'Please wait for the Transit Layer to load before trying to interact with it.',
      );
    }
  }
}
