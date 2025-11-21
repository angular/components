/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface MapAnchorPoint {
  getAnchor(): google.maps.MVCObject | google.maps.marker.AdvancedMarkerElement;
}
