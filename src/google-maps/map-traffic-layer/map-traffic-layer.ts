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
  Directive,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';

/**
 * Angular component that renders a Google Maps Traffic Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer
 */
@Directive({
  selector: 'map-traffic-layer',
  exportAs: 'mapTrafficLayer',
  standalone: true,
})
export class MapTrafficLayer implements OnInit, OnDestroy {
  private readonly _map = inject(GoogleMap);
  private readonly _ngZone = inject(NgZone);
  private readonly _autoRefresh = new BehaviorSubject<boolean>(true);
  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.TrafficLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer
   */
  trafficLayer?: google.maps.TrafficLayer;

  /**
   * Whether the traffic layer refreshes with updated information automatically.
   */
  @Input()
  set autoRefresh(autoRefresh: boolean) {
    this._autoRefresh.next(autoRefresh);
  }

  /** Event emitted when the traffic layer is initialized. */
  @Output() readonly trafficLayerInitialized: EventEmitter<google.maps.TrafficLayer> =
    new EventEmitter<google.maps.TrafficLayer>();

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions()
        .pipe(take(1))
        .subscribe(options => {
          if (google.maps.TrafficLayer && this._map.googleMap) {
            this._initialize(this._map.googleMap, google.maps.TrafficLayer, options);
          } else {
            this._ngZone.runOutsideAngular(() => {
              Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
                ([map, lib]) => {
                  this._initialize(map, (lib as google.maps.MapsLibrary).TrafficLayer, options);
                },
              );
            });
          }
        });
    }
  }

  private _initialize(
    map: google.maps.Map,
    layerConstructor: typeof google.maps.TrafficLayer,
    options: google.maps.TrafficLayerOptions,
  ) {
    this._ngZone.runOutsideAngular(() => {
      this.trafficLayer = new layerConstructor(options);
      this._assertInitialized();
      this.trafficLayer.setMap(map);
      this.trafficLayerInitialized.emit(this.trafficLayer);
      this._watchForAutoRefreshChanges();
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this.trafficLayer?.setMap(null);
  }

  private _combineOptions(): Observable<google.maps.TrafficLayerOptions> {
    return this._autoRefresh.pipe(
      map(autoRefresh => {
        const combinedOptions: google.maps.TrafficLayerOptions = {autoRefresh};
        return combinedOptions;
      }),
    );
  }

  private _watchForAutoRefreshChanges() {
    this._combineOptions()
      .pipe(takeUntil(this._destroyed))
      .subscribe(options => {
        this._assertInitialized();
        this.trafficLayer.setOptions(options);
      });
  }

  private _assertInitialized(): asserts this is {trafficLayer: google.maps.TrafficLayer} {
    if (!this.trafficLayer) {
      throw Error(
        'Cannot interact with a Google Map Traffic Layer before it has been initialized. ' +
          'Please wait for the Traffic Layer to load before trying to interact with it.',
      );
    }
  }
}
