/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, NgZone, inject} from '@angular/core';
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
  private readonly _ngZone = inject(NgZone);
  private _directionsService: google.maps.DirectionsService | undefined;

  constructor(...args: unknown[]);
  constructor() {}

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

  private _getService(): Promise<google.maps.DirectionsService> {
    if (!this._directionsService) {
      if (google.maps.DirectionsService) {
        this._directionsService = new google.maps.DirectionsService();
      } else {
        return google.maps.importLibrary('routes').then(lib => {
          this._directionsService = new (lib as google.maps.RoutesLibrary).DirectionsService();
          return this._directionsService;
        });
      }
    }

    return Promise.resolve(this._directionsService);
  }
}
