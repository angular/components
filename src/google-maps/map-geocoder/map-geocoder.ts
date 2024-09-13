/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" preserve="true" />

import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';

export interface MapGeocoderResponse {
  status: google.maps.GeocoderStatus;
  results: google.maps.GeocoderResult[];
}

/**
 * Angular service that wraps the Google Maps Geocoder from the Google Maps JavaScript API.
 * See developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder
 */
@Injectable({providedIn: 'root'})
export class MapGeocoder {
  private _geocoder: google.maps.Geocoder | undefined;

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * See developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder.geocode
   */
  geocode(request: google.maps.GeocoderRequest): Observable<MapGeocoderResponse> {
    return new Observable(observer => {
      this._getGeocoder().then(geocoder => {
        geocoder.geocode(request, (results, status) => {
          this._ngZone.run(() => {
            observer.next({results: results || [], status});
            observer.complete();
          });
        });
      });
    });
  }

  private _getGeocoder(): Promise<google.maps.Geocoder> {
    if (!this._geocoder) {
      if (google.maps.Geocoder) {
        this._geocoder = new google.maps.Geocoder();
      } else {
        return google.maps.importLibrary('geocoding').then(lib => {
          this._geocoder = new (lib as google.maps.GeocodingLibrary).Geocoder();
          return this._geocoder;
        });
      }
    }

    return Promise.resolve(this._geocoder);
  }
}
