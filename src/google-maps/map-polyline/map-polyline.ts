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
  Input,
  OnDestroy,
  OnInit,
  Output,
  NgZone,
  inject,
  EventEmitter,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Polyline via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline
 */
@Directive({
  selector: 'map-polyline',
  exportAs: 'mapPolyline',
})
export class MapPolyline implements OnInit, OnDestroy {
  private readonly _map = inject(GoogleMap);
  private _ngZone = inject(NgZone);
  private _eventManager = new MapEventManager(inject(NgZone));
  private readonly _options = new BehaviorSubject<google.maps.PolylineOptions>({});
  private readonly _path = new BehaviorSubject<
    | google.maps.MVCArray<google.maps.LatLng>
    | google.maps.LatLng[]
    | google.maps.LatLngLiteral[]
    | undefined
  >(undefined);

  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.Polyline object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline
   */
  polyline?: google.maps.Polyline;

  @Input()
  set options(options: google.maps.PolylineOptions) {
    this._options.next(options || {});
  }

  @Input()
  set path(
    path:
      | google.maps.MVCArray<google.maps.LatLng>
      | google.maps.LatLng[]
      | google.maps.LatLngLiteral[],
  ) {
    this._path.next(path);
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.click
   */
  @Output() readonly polylineClick: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('click');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dblclick
   */
  @Output() readonly polylineDblclick: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('dblclick');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.drag
   */
  @Output() readonly polylineDrag: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('drag');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragend
   */
  @Output() readonly polylineDragend: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragend');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragstart
   */
  @Output() readonly polylineDragstart: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragstart');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousedown
   */
  @Output() readonly polylineMousedown: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mousedown');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousemove
   */
  @Output() readonly polylineMousemove: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mousemove');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseout
   */
  @Output() readonly polylineMouseout: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseout');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseover
   */
  @Output() readonly polylineMouseover: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseover');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseup
   */
  @Output() readonly polylineMouseup: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseup');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.rightclick
   */
  @Output() readonly polylineRightclick: Observable<google.maps.PolyMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('rightclick');

  /** Event emitted when the polyline is initialized. */
  @Output() readonly polylineInitialized: EventEmitter<google.maps.Polyline> =
    new EventEmitter<google.maps.Polyline>();

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions()
        .pipe(take(1))
        .subscribe(options => {
          if (google.maps.Polyline && this._map.googleMap) {
            this._initialize(this._map.googleMap, google.maps.Polyline, options);
          } else {
            this._ngZone.runOutsideAngular(() => {
              Promise.all([this._map._resolveMap(), google.maps.importLibrary('maps')]).then(
                ([map, lib]) => {
                  this._initialize(map, (lib as google.maps.MapsLibrary).Polyline, options);
                },
              );
            });
          }
        });
    }
  }

  private _initialize(
    map: google.maps.Map,
    polylineConstructor: typeof google.maps.Polyline,
    options: google.maps.PolygonOptions,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.polyline = new polylineConstructor(options);
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        assertInitialized(this);
      }
      this.polyline.setMap(map);
      this._eventManager.setTarget(this.polyline);
      this.polylineInitialized.emit(this.polyline);
      this._watchForOptionsChanges();
      this._watchForPathChanges();
    });
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    this.polyline?.setMap(null);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getDraggable
   */
  getDraggable(): boolean {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.polyline!.getDraggable();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getEditable
   */
  getEditable(): boolean {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.polyline!.getEditable();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getPath
   */
  getPath(): google.maps.MVCArray<google.maps.LatLng> {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.polyline!.getPath();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getVisible
   */
  getVisible(): boolean {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertInitialized(this);
    }
    return this.polyline!.getVisible();
  }

  private _combineOptions(): Observable<google.maps.PolylineOptions> {
    return combineLatest([this._options, this._path]).pipe(
      map(([options, path]) => {
        const combinedOptions: google.maps.PolylineOptions = {
          ...options,
          path: path || options.path,
        };
        return combinedOptions;
      }),
    );
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        assertInitialized(this);
      }
      this.polyline!.setOptions(options);
    });
  }

  private _watchForPathChanges() {
    this._path.pipe(takeUntil(this._destroyed)).subscribe(path => {
      if (path) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          assertInitialized(this);
        }
        this.polyline!.setPath(path);
      }
    });
  }
}

function assertInitialized(ctx: MapPolyline) {
  if (!ctx.polyline) {
    throw Error(
      'Cannot interact with a Google Map Polyline before it has been ' +
        'initialized. Please wait for the Polyline to load before trying to interact with it.',
    );
  }
}
