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
 * Angular component that renders a Google Maps Transit Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
 */
@Directive({
  selector: 'map-transit-layer',
  exportAs: 'mapTransitLayer',
  standalone: true,
})
export class MapTransitLayer extends MapBaseLayer {
  /**
   * The underlying google.maps.TransitLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
   */
  transitLayer?: google.maps.TransitLayer;

  /** Event emitted when the transit layer is initialized. */
  @Output() readonly transitLayerInitialized: EventEmitter<google.maps.TransitLayer> =
    new EventEmitter<google.maps.TransitLayer>();

  protected override async _initializeObject() {
    const layerConstructor =
      google.maps.TransitLayer ||
      ((await google.maps.importLibrary('maps')) as google.maps.MapsLibrary).TransitLayer;
    this.transitLayer = new layerConstructor();
    this.transitLayerInitialized.emit(this.transitLayer);
  }

  protected override _setMap(map: google.maps.Map) {
    this._assertLayerInitialized();
    this.transitLayer.setMap(map);
  }

  protected override _unsetMap() {
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
