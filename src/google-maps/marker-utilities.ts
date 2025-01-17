/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/** Marker types from the Google Maps API. */
export type Marker = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

/** Interface that should be implemented by directives that wrap marker APIs. */
export interface MarkerDirective {
  _resolveMarker(): Promise<Marker>;
}

/** Token that marker directives can use to expose themselves to the clusterer. */
export const MAP_MARKER = new InjectionToken<MarkerDirective>('MAP_MARKER');
