/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" preserve="true" />

import {
  Input,
  OnDestroy,
  OnInit,
  NgZone,
  Directive,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';

import {GoogleMap} from '../google-map/google-map';

/** Possible data that can be shown on a heatmap layer. */
export type HeatmapData =
  | google.maps.MVCArray<
      google.maps.LatLng | google.maps.visualization.WeightedLocation | google.maps.LatLngLiteral
    >
  | (google.maps.LatLng | google.maps.visualization.WeightedLocation | google.maps.LatLngLiteral)[];

/**
 * Angular directive that renders a Google Maps heatmap via the Google Maps JavaScript API.
 *
 * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
 */
@Directive({
  selector: 'map-heatmap-layer',
  exportAs: 'mapHeatmapLayer',
  standalone: true,
})
export class MapHeatmapLayer implements OnInit, OnChanges, OnDestroy {
  private readonly _googleMap = inject(GoogleMap);
  private _ngZone = inject(NgZone);

  /**
   * Data shown on the heatmap.
   * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
   */
  @Input()
  set data(data: HeatmapData) {
    this._data = data;
  }
  private _data: HeatmapData;

  /**
   * Options used to configure the heatmap. See:
   * developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayerOptions
   */
  @Input()
  set options(options: Partial<google.maps.visualization.HeatmapLayerOptions>) {
    this._options = options;
  }
  private _options: Partial<google.maps.visualization.HeatmapLayerOptions>;

  /**
   * The underlying google.maps.visualization.HeatmapLayer object.
   *
   * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
   */
  heatmap?: google.maps.visualization.HeatmapLayer;

  /** Event emitted when the heatmap is initialized. */
  @Output() readonly heatmapInitialized: EventEmitter<google.maps.visualization.HeatmapLayer> =
    new EventEmitter<google.maps.visualization.HeatmapLayer>();

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._googleMap._isBrowser) {
      if (
        !window.google?.maps?.visualization &&
        !window.google?.maps.importLibrary &&
        (typeof ngDevMode === 'undefined' || ngDevMode)
      ) {
        throw Error(
          'Namespace `google.maps.visualization` not found, cannot construct heatmap. ' +
            'Please install the Google Maps JavaScript API with the "visualization" library: ' +
            'https://developers.google.com/maps/documentation/javascript/visualization',
        );
      }

      if (google.maps.visualization?.HeatmapLayer && this._googleMap.googleMap) {
        this._initialize(this._googleMap.googleMap, google.maps.visualization.HeatmapLayer);
      } else {
        this._ngZone.runOutsideAngular(() => {
          Promise.all([
            this._googleMap._resolveMap(),
            google.maps.importLibrary('visualization'),
          ]).then(([map, lib]) => {
            this._initialize(map, (lib as google.maps.VisualizationLibrary).HeatmapLayer);
          });
        });
      }
    }
  }

  private _initialize(
    map: google.maps.Map,
    heatmapConstructor: typeof google.maps.visualization.HeatmapLayer,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.heatmap = new heatmapConstructor(this._combineOptions());
      this._assertInitialized();
      this.heatmap.setMap(map);
      this.heatmapInitialized.emit(this.heatmap);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const {_data, heatmap} = this;

    if (heatmap) {
      if (changes['options']) {
        heatmap.setOptions(this._combineOptions());
      }

      if (changes['data'] && _data !== undefined) {
        heatmap.setData(this._normalizeData(_data));
      }
    }
  }

  ngOnDestroy() {
    this.heatmap?.setMap(null);
  }

  /**
   * Gets the data that is currently shown on the heatmap.
   * See: developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer
   */
  getData(): HeatmapData {
    this._assertInitialized();
    return this.heatmap.getData();
  }

  /** Creates a combined options object using the passed-in options and the individual inputs. */
  private _combineOptions(): google.maps.visualization.HeatmapLayerOptions {
    const options = this._options || {};
    return {
      ...options,
      data: this._normalizeData(this._data || options.data || []),
      map: this._googleMap.googleMap,
    };
  }

  /**
   * Most Google Maps APIs support both `LatLng` objects and `LatLngLiteral`. The latter is more
   * convenient to write out, because the Google Maps API doesn't have to have been loaded in order
   * to construct them. The `HeatmapLayer` appears to be an exception that only allows a `LatLng`
   * object, or it throws a runtime error. Since it's more convenient and we expect that Angular
   * users will load the API asynchronously, we allow them to pass in a `LatLngLiteral` and we
   * convert it to a `LatLng` object before passing it off to Google Maps.
   */
  private _normalizeData(data: HeatmapData) {
    const result: (google.maps.LatLng | google.maps.visualization.WeightedLocation)[] = [];

    data.forEach(item => {
      result.push(isLatLngLiteral(item) ? new google.maps.LatLng(item.lat, item.lng) : item);
    });

    return result;
  }

  /** Asserts that the heatmap object has been initialized. */
  private _assertInitialized(): asserts this is {heatmap: google.maps.visualization.HeatmapLayer} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.heatmap) {
        throw Error(
          'Cannot interact with a Google Map HeatmapLayer before it has been ' +
            'initialized. Please wait for the heatmap to load before trying to interact with it.',
        );
      }
    }
  }
}

/** Asserts that an object is a `LatLngLiteral`. */
function isLatLngLiteral(value: any): value is google.maps.LatLngLiteral {
  return value && typeof value.lat === 'number' && typeof value.lng === 'number';
}
