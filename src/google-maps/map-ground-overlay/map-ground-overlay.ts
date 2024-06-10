/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
import {takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Ground Overlay via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay
 */
@Directive({
  selector: 'map-ground-overlay',
  exportAs: 'mapGroundOverlay',
  standalone: true,
})
export class MapGroundOverlay implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(inject(NgZone));

  private readonly _opacity = new BehaviorSubject<number>(1);
  private readonly _url = new BehaviorSubject<string>('');
  private readonly _bounds = new BehaviorSubject<
    google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral | undefined
  >(undefined);
  private readonly _destroyed = new Subject<void>();
  private _hasWatchers: boolean;

  /**
   * The underlying google.maps.GroundOverlay object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay
   */
  groundOverlay?: google.maps.GroundOverlay;

  /** URL of the image that will be shown in the overlay. */
  @Input()
  set url(url: string) {
    this._url.next(url);
  }

  /** Bounds for the overlay. */
  @Input()
  get bounds(): google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral {
    return this._bounds.value!;
  }
  set bounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) {
    this._bounds.next(bounds);
  }

  /** Whether the overlay is clickable */
  @Input() clickable: boolean = false;

  /** Opacity of the overlay. */
  @Input()
  set opacity(opacity: number) {
    this._opacity.next(opacity);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay.click
   */
  @Output() readonly mapClick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.dblclick
   */
  @Output() readonly mapDblclick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dblclick');

  /** Event emitted when the ground overlay is initialized. */
  @Output() readonly groundOverlayInitialized: EventEmitter<google.maps.GroundOverlay> =
    new EventEmitter<google.maps.GroundOverlay>();

  constructor(
    private readonly _map: GoogleMap,
    private readonly _ngZone: NgZone,
  ) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      // The ground overlay setup is slightly different from the other Google Maps objects in that
      // we have to recreate the `GroundOverlay` object whenever the bounds change, because
      // Google Maps doesn't provide an API to update the bounds of an existing overlay.
      this._bounds.pipe(takeUntil(this._destroyed)).subscribe(bounds => {
        if (this.groundOverlay) {
          this.groundOverlay.setMap(null);
          this.groundOverlay = undefined;
        }

        if (!bounds) {
          return;
        }

        if (google.maps.GroundOverlay && this._map.googleMap) {
          this._initialize(this._map.googleMap, google.maps.GroundOverlay, bounds);
        } else {
          this._ngZone.runOutsideAngular(() => {
            Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
              ([map, lib]) => {
                this._initialize(map, (lib as google.maps.MapsLibrary).GroundOverlay, bounds);
              },
            );
          });
        }
      });
    }
  }

  private _initialize(
    map: google.maps.Map,
    overlayConstructor: typeof google.maps.GroundOverlay,
    bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.groundOverlay = new overlayConstructor(this._url.getValue(), bounds, {
        clickable: this.clickable,
        opacity: this._opacity.value,
      });
      this._assertInitialized();
      this.groundOverlay.setMap(map);
      this._eventManager.setTarget(this.groundOverlay);
      this.groundOverlayInitialized.emit(this.groundOverlay);

      // We only need to set up the watchers once.
      if (!this._hasWatchers) {
        this._hasWatchers = true;
        this._watchForOpacityChanges();
        this._watchForUrlChanges();
      }
    });
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.groundOverlay?.setMap(null);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getBounds
   */
  getBounds(): google.maps.LatLngBounds | null {
    this._assertInitialized();
    return this.groundOverlay.getBounds();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getOpacity
   */
  getOpacity(): number {
    this._assertInitialized();
    return this.groundOverlay.getOpacity();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getUrl
   */
  getUrl(): string {
    this._assertInitialized();
    return this.groundOverlay.getUrl();
  }

  private _watchForOpacityChanges() {
    this._opacity.pipe(takeUntil(this._destroyed)).subscribe(opacity => {
      if (opacity != null) {
        this.groundOverlay?.setOpacity(opacity);
      }
    });
  }

  private _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe(url => {
      const overlay = this.groundOverlay;

      if (overlay) {
        overlay.set('url', url);
        // Google Maps only redraws the overlay if we re-set the map.
        overlay.setMap(null);
        overlay.setMap(this._map.googleMap!);
      }
    });
  }

  private _assertInitialized(): asserts this is {groundOverlay: google.maps.GroundOverlay} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.groundOverlay) {
        throw Error(
          'Cannot interact with a Google Map GroundOverlay before it has been initialized. ' +
            'Please wait for the GroundOverlay to load before trying to interact with it.',
        );
      }
    }
  }
}
