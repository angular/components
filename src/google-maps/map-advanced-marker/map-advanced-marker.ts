/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {
  Input,
  OnDestroy,
  OnInit,
  Output,
  NgZone,
  Directive,
  OnChanges,
  SimpleChanges,
  inject,
  EventEmitter,
} from '@angular/core';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';
import {Observable} from 'rxjs';
import {MapAnchorPoint} from '../map-anchor-point';

/**
 * Default options for the Google Maps marker component. Displays a marker
 * at the Googleplex.
 */
export const DEFAULT_MARKER_OPTIONS = {
  position: {lat: 37.221995, lng: -122.184092},
};

/**
 * Angular component that renders a Google Maps marker via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/marker
 */
@Directive({
  selector: 'map-advanced-marker',
  exportAs: 'mapAdvancedMarker',
  standalone: true,
})
export class MapAdvancedMarker implements OnInit, OnChanges, OnDestroy, MapAnchorPoint {
  private _eventManager = new MapEventManager(inject(NgZone));

  /**
   * Rollover text. If provided, an accessibility text (e.g. for use with screen readers) will be added to the AdvancedMarkerElement with the provided value.
   * See: https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions.title
   */
  @Input()
  set title(title: string) {
    this._title = title;
  }
  private _title: string;

  /**
   * Sets the AdvancedMarkerElement's position. An AdvancedMarkerElement may be constructed without a position, but will not be displayed until its position is provided - for example, by a user's actions or choices. An AdvancedMarkerElement's position can be provided by setting AdvancedMarkerElement.position if not provided at the construction.
   * Note: AdvancedMarkerElement with altitude is only supported on vector maps.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions.position
   */
  @Input()
  set position(
    position:
      | google.maps.LatLngLiteral
      | google.maps.LatLng
      | google.maps.LatLngAltitude
      | google.maps.LatLngAltitudeLiteral,
  ) {
    this._position = position;
  }
  private _position: google.maps.LatLngLiteral | google.maps.LatLng;

  /**
   * The DOM Element backing the visual of an AdvancedMarkerElement.
   * Note: AdvancedMarkerElement does not clone the passed-in DOM element. Once the DOM element is passed to an AdvancedMarkerElement, passing the same DOM element to another AdvancedMarkerElement will move the DOM element and cause the previous AdvancedMarkerElement to look empty.
   * See: https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions.content
   */
  @Input()
  set content(content: Node | google.maps.marker.PinElement | null) {
    this._content = content;
  }
  private _content: Node | null;

  /**
   * If true, the AdvancedMarkerElement can be dragged.
   * Note: AdvancedMarkerElement with altitude is not draggable.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions.gmpDraggable
   */
  @Input()
  set gmpDraggable(draggable: boolean) {
    this._draggable = draggable;
  }
  private _draggable: boolean;

  /**
   * Options for constructing an AdvancedMarkerElement.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions
   */
  @Input()
  set options(options: google.maps.marker.AdvancedMarkerElementOptions) {
    this._options = options;
  }
  private _options: google.maps.marker.AdvancedMarkerElementOptions;

  /**
   * AdvancedMarkerElements on the map are prioritized by zIndex, with higher values indicating higher display.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElementOptions.zIndex
   */
  @Input()
  set zIndex(zIndex: number) {
    this._zIndex = zIndex;
  }
  private _zIndex: number;

  /**
   * This event is fired when the AdvancedMarkerElement element is clicked.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement.click
   */
  @Output() readonly mapClick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('click');

  /**
   * This event is repeatedly fired while the user drags the AdvancedMarkerElement.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement.drag
   */
  @Output() readonly mapDrag: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('drag');

  /**
   * This event is fired when the user stops dragging the AdvancedMarkerElement.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement.dragend
   */
  @Output() readonly mapDragend: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragend');

  /**
   * This event is fired when the user starts dragging the AdvancedMarkerElement.
   * https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement.dragstart
   */
  @Output() readonly mapDragstart: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragstart');

  /** Event emitted when the marker is initialized. */
  @Output() readonly markerInitialized: EventEmitter<google.maps.marker.AdvancedMarkerElement> =
    new EventEmitter<google.maps.marker.AdvancedMarkerElement>();

  /**
   * The underlying google.maps.marker.AdvancedMarkerElement object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/advanced-markers#AdvancedMarkerElement
   */
  advancedMarker: google.maps.marker.AdvancedMarkerElement;

  constructor(
    private readonly _googleMap: GoogleMap,
    private _ngZone: NgZone,
  ) {}

  ngOnInit() {
    if (!this._googleMap._isBrowser) {
      return;
    }
    if (google.maps.marker?.AdvancedMarkerElement && this._googleMap.googleMap) {
      this._initialize(this._googleMap.googleMap, google.maps.marker.AdvancedMarkerElement);
    } else {
      this._ngZone.runOutsideAngular(() => {
        Promise.all([this._googleMap._resolveMap(), google.maps.importLibrary('marker')]).then(
          ([map, lib]) => {
            this._initialize(map, (lib as google.maps.MarkerLibrary).AdvancedMarkerElement);
          },
        );
      });
    }
  }

  private _initialize(
    map: google.maps.Map,
    advancedMarkerConstructor: typeof google.maps.marker.AdvancedMarkerElement,
  ) {
    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.advancedMarker = new advancedMarkerConstructor(this._combineOptions());
      this._assertInitialized();
      this.advancedMarker.map = map;
      this._eventManager.setTarget(this.advancedMarker);
      this.markerInitialized.next(this.advancedMarker);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const {advancedMarker, _content, _position, _title, _draggable, _zIndex} = this;
    if (advancedMarker) {
      if (changes['title']) {
        advancedMarker.title = _title;
      }

      if (changes['content']) {
        advancedMarker.content = _content;
      }

      if (changes['gmpDraggable']) {
        advancedMarker.gmpDraggable = _draggable;
      }

      if (changes['content']) {
        advancedMarker.content = _content;
      }

      if (changes['position']) {
        advancedMarker.position = _position;
      }

      if (changes['zIndex']) {
        advancedMarker.zIndex = _zIndex;
      }
    }
  }

  ngOnDestroy() {
    this.markerInitialized.complete();
    this._eventManager.destroy();

    if (this.advancedMarker) {
      this.advancedMarker.map = null;
    }
  }

  getAnchor(): google.maps.marker.AdvancedMarkerElement {
    this._assertInitialized();
    return this.advancedMarker;
  }

  /** Creates a combined options object using the passed-in options and the individual inputs. */
  private _combineOptions(): google.maps.marker.AdvancedMarkerElementOptions {
    const options = this._options || DEFAULT_MARKER_OPTIONS;
    return {
      ...options,
      title: this._title || options.title,
      position: this._position || options.position,
      content: this._content || options.content,
      zIndex: this._zIndex ?? options.zIndex,
      gmpDraggable: this._draggable ?? options.gmpDraggable,
      map: this._googleMap.googleMap,
    };
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is {marker: google.maps.marker.AdvancedMarkerElement} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.advancedMarker) {
        throw Error(
          'Cannot interact with a Google Map Marker before it has been ' +
            'initialized. Please wait for the Marker to load before trying to interact with it.',
        );
      }
    }
  }
}
