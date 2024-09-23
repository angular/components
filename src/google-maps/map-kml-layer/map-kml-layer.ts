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
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps KML Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer
 */
@Directive({
  selector: 'map-kml-layer',
  exportAs: 'mapKmlLayer',
  standalone: true,
})
export class MapKmlLayer implements OnInit, OnDestroy {
  private readonly _map = inject(GoogleMap);
  private _ngZone = inject(NgZone);
  private _eventManager = new MapEventManager(inject(NgZone));
  private readonly _options = new BehaviorSubject<google.maps.KmlLayerOptions>({});
  private readonly _url = new BehaviorSubject<string>('');

  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.KmlLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer
   */
  kmlLayer?: google.maps.KmlLayer;

  @Input()
  set options(options: google.maps.KmlLayerOptions) {
    this._options.next(options || {});
  }

  @Input()
  set url(url: string) {
    this._url.next(url);
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.click
   */
  @Output() readonly kmlClick: Observable<google.maps.KmlMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.KmlMouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/kml
   * #KmlLayer.defaultviewport_changed
   */
  @Output() readonly defaultviewportChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('defaultviewport_changed');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.status_changed
   */
  @Output() readonly statusChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('status_changed');

  /** Event emitted when the KML layer is initialized. */
  @Output() readonly kmlLayerInitialized: EventEmitter<google.maps.KmlLayer> =
    new EventEmitter<google.maps.KmlLayer>();

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions()
        .pipe(take(1))
        .subscribe(options => {
          if (google.maps.KmlLayer && this._map.googleMap) {
            this._initialize(this._map.googleMap, google.maps.KmlLayer, options);
          } else {
            this._ngZone.runOutsideAngular(() => {
              Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
                ([map, lib]) => {
                  this._initialize(map, (lib as google.maps.MapsLibrary).KmlLayer, options);
                },
              );
            });
          }
        });
    }
  }

  private _initialize(
    map: google.maps.Map,
    layerConstructor: typeof google.maps.KmlLayer,
    options: google.maps.KmlLayerOptions,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.kmlLayer = new layerConstructor(options);
      this._assertInitialized();
      this.kmlLayer.setMap(map);
      this._eventManager.setTarget(this.kmlLayer);
      this.kmlLayerInitialized.emit(this.kmlLayer);
      this._watchForOptionsChanges();
      this._watchForUrlChanges();
    });
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.kmlLayer?.setMap(null);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getDefaultViewport
   */
  getDefaultViewport(): google.maps.LatLngBounds | null {
    this._assertInitialized();
    return this.kmlLayer.getDefaultViewport();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getMetadata
   */
  getMetadata(): google.maps.KmlLayerMetadata | null {
    this._assertInitialized();
    return this.kmlLayer.getMetadata();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getStatus
   */
  getStatus(): google.maps.KmlLayerStatus {
    this._assertInitialized();
    return this.kmlLayer.getStatus();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getUrl
   */
  getUrl(): string {
    this._assertInitialized();
    return this.kmlLayer.getUrl();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getZIndex
   */
  getZIndex(): number {
    this._assertInitialized();
    return this.kmlLayer.getZIndex();
  }

  private _combineOptions(): Observable<google.maps.KmlLayerOptions> {
    return combineLatest([this._options, this._url]).pipe(
      map(([options, url]) => {
        const combinedOptions: google.maps.KmlLayerOptions = {
          ...options,
          url: url || options.url,
        };
        return combinedOptions;
      }),
    );
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      if (this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setOptions(options);
      }
    });
  }

  private _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe(url => {
      if (url && this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setUrl(url);
      }
    });
  }

  private _assertInitialized(): asserts this is {kmlLayer: google.maps.KmlLayer} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.kmlLayer) {
        throw Error(
          'Cannot interact with a Google Map KmlLayer before it has been ' +
            'initialized. Please wait for the KmlLayer to load before trying to interact with it.',
        );
      }
    }
  }
}
