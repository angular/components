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
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {Observable} from 'rxjs';
import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Directions Renderer via the Google Maps
 * JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/directions#DirectionsRenderer
 */
@Directive({
  selector: 'map-directions-renderer',
  exportAs: 'mapDirectionsRenderer',
})
export class MapDirectionsRenderer implements OnInit, OnChanges, OnDestroy {
  private readonly _googleMap = inject(GoogleMap);
  private _ngZone = inject(NgZone);
  private _eventManager = new MapEventManager(inject(NgZone));

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRendererOptions.directions
   */
  @Input()
  set directions(directions: google.maps.DirectionsResult) {
    this._directions = directions;
  }
  private _directions: google.maps.DirectionsResult;

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRendererOptions
   */
  @Input()
  set options(options: google.maps.DirectionsRendererOptions) {
    this._options = options;
  }
  private _options: google.maps.DirectionsRendererOptions;

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.directions_changed
   */
  @Output()
  readonly directionsChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('directions_changed');

  /** Event emitted when the directions renderer is initialized. */
  @Output() readonly directionsRendererInitialized: EventEmitter<google.maps.DirectionsRenderer> =
    new EventEmitter<google.maps.DirectionsRenderer>();

  /** The underlying google.maps.DirectionsRenderer object. */
  directionsRenderer?: google.maps.DirectionsRenderer;

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._googleMap._isBrowser) {
      if (google.maps.DirectionsRenderer && this._googleMap.googleMap) {
        this._initialize(this._googleMap.googleMap, google.maps.DirectionsRenderer);
      } else {
        this._ngZone.runOutsideAngular(() => {
          Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary('routes')]).then(
            ([map, lib]) => {
              this._initialize(map, (lib as google.maps.RoutesLibrary).DirectionsRenderer);
            },
          );
        });
      }
    }
  }

  private _initialize(
    map: google.maps.Map,
    rendererConstructor: typeof google.maps.DirectionsRenderer,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.directionsRenderer = new rendererConstructor(this._combineOptions());
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        assertInitialized(this);
      }
      this.directionsRenderer.setMap(map);
      this._eventManager.setTarget(this.directionsRenderer);
      this.directionsRendererInitialized.emit(this.directionsRenderer);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.directionsRenderer) {
      if (changes['options']) {
        this.directionsRenderer.setOptions(this._combineOptions());
      }

      if (changes['directions'] && this._directions !== undefined) {
        this.directionsRenderer.setDirections(this._directions);
      }
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this.directionsRenderer?.setMap(null);
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getDirections
   */
  getDirections(): google.maps.DirectionsResult | null {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.directionsRenderer!.getDirections();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getPanel
   */
  getPanel(): Node | null {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.directionsRenderer!.getPanel();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsRenderer.getRouteIndex
   */
  getRouteIndex(): number {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.directionsRenderer!.getRouteIndex();
  }

  private _combineOptions(): google.maps.DirectionsRendererOptions {
    const options = this._options || {};
    return {
      ...options,
      directions: this._directions || options.directions,
      map: this._googleMap.googleMap,
    };
  }
}

function assertInitialized(ctx: MapDirectionsRenderer) {
  if (!ctx.directionsRenderer) {
    throw Error(
      'Cannot interact with a Google Map Directions Renderer before it has been ' +
        'initialized. Please wait for the Directions Renderer to load before trying ' +
        'to interact with it.',
    );
  }
}
