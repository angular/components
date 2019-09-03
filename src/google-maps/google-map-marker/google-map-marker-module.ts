/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {GoogleMapMarker} from './google-map-marker';

@NgModule({
  exports: [GoogleMapMarker],
  declarations: [GoogleMapMarker],
})
export class GoogleMapMarkerModule { }
