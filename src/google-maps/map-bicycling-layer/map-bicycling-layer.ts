/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Directive, EventEmitter, Output} from '@angular/core';

import {MapBaseLayer} from '../map-base-layer';

/**
 * Angular component that renders a Google Maps Bicycling Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
 */
@Directive({
  selector: 'map-bicycling-layer',
  exportAs: 'mapBicyclingLayer',
  standalone: true,
})
export class MapBicyclingLayer extends MapBaseLayer {
  /**
   * The underlying google.maps.BicyclingLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
   */
  bicyclingLayer?: google.maps.BicyclingLayer;

  /** Event emitted when the bicycling layer is initialized. */
  @Output() readonly bicyclingLayerInitialized: EventEmitter<google.maps.BicyclingLayer> =
    new EventEmitter<google.maps.BicyclingLayer>();

  protected override async _initializeObject() {
    const layerConstructor =
      google.maps.BicyclingLayer ||
      ((await google.maps.importLibrary('maps')) as google.maps.MapsLibrary).BicyclingLayer;
    this.bicyclingLayer = new layerConstructor();
    this.bicyclingLayerInitialized.emit(this.bicyclingLayer);
  }

  protected override _setMap(map: google.maps.Map) {
    this._assertLayerInitialized();
    this.bicyclingLayer.setMap(map);
  }

  protected override _unsetMap() {
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
