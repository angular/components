/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {MapMarker, MapMarkerModule} from '../map-marker/index';

import {GoogleMap} from './google-map';

@NgModule({
  imports: [MapMarkerModule],
  exports: [GoogleMap, MapMarker],
  declarations: [GoogleMap],
})
export class GoogleMapModule {
}
