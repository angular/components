/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Injectable, NgZone} from '@angular/core';
import {importLibrary} from '../import-library';
import {Observable} from 'rxjs';

export interface MapDirectionsResponse {
  status: google.maps.DirectionsStatus;
  result?: google.maps.DirectionsResult;
}

/**
 * Angular service that wraps the Google Maps DirectionsService from the Google Maps JavaScript
 * API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/directions#DirectionsService
 */
@Injectable({providedIn: 'root'})
export class MapDirectionsService {
  private _directionsService: google.maps.DirectionsService | undefined;

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsService.route
   */
  route(request: google.maps.DirectionsRequest): Observable<MapDirectionsResponse> {
    return new Observable(observer => {
      this._getService().then(service => {
        service.route(request, (result, status) => {
          this._ngZone.run(() => {
            observer.next({result: result || undefined, status});
            observer.complete();
          });
        });
      });
    });
  }

  private async _getService(): Promise<google.maps.DirectionsService> {
    if (!this._directionsService) {
      const serviceConstructor =
        google.maps.DirectionsService ||
        (await importLibrary<google.maps.DirectionsService>('routes', 'DirectionsService'));
      this._directionsService = new serviceConstructor();
    }

    return this._directionsService;
  }
}
