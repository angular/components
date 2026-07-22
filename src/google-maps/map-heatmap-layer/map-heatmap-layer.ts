/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Input, Directive, Output, EventEmitter} from '@angular/core';

/**
 * Possible data that can be shown on a heatmap layer.
 * @deprecated Google Maps no longer supports the heatmap API.
 * @breaking-change 23.0.0
 */
export type HeatmapData = any;

/**
 * Angular directive that renders a Google Maps heatmap via the Google Maps JavaScript API.
 *
 * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
 *
 * @deprecated Google Maps no longer supports the heatmap API so this component is now a no-op that will be deleted.
 * @breaking-change 23.0.0
 */
@Directive({
  selector: 'map-heatmap-layer',
  exportAs: 'mapHeatmapLayer',
})
export class MapHeatmapLayer {
  /**
   * Data shown on the heatmap.
   * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
   */
  @Input()
  set data(data: HeatmapData) {}

  /**
   * Options used to configure the heatmap. See:
   * developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayerOptions
   */
  @Input()
  set options(options: any) {}

  /**
   * The underlying google.maps.visualization.HeatmapLayer object.
   *
   * See: https://developers.google.com/maps/documentation/javascript/reference/visualization
   */
  heatmap?: any;

  /** Event emitted when the heatmap is initialized. */
  @Output() readonly heatmapInitialized: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    console.error(
      'As of May 2026, Google Maps no longer supports the heatmap layer APIs. ' +
        'As a result, the `<map-heatmap-layer>` component is a no-op that will ' +
        'be removed completely in Angular v23.\nMore information: ' +
        'https://developers.google.com/maps/deprecations?utm_source=devtools&utm_campaign=stable#heatmap-layer-js-deprecation',
    );
  }

  /**
   * Gets the data that is currently shown on the heatmap.
   * See: developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer
   */
  getData(): HeatmapData {
    return null;
  }
}
