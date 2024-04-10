import {MapAdvancedMarker} from './../map-advanced-marker/map-advanced-marker';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />
/// <reference path="marker-clusterer-types.ts" />

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {Observable, Subscription, combineLatest, merge} from 'rxjs';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';
import {MapMarker} from '../map-marker/map-marker';

declare const markerClusterer: {
  MarkerClusterer: typeof MarkerClusterer;
  defaultOnClusterClickHandler: onClusterClickHandler;
};

type MapMarkerComponent = MapMarker | MapAdvancedMarker;
/**
 * Angular component for implementing a Google Maps Marker Clusterer.
 *
 * See https://developers.google.com/maps/documentation/javascript/marker-clustering
 */
@Component({
  selector: 'map-marker-clusterer',
  exportAs: 'mapMarkerClusterer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class MapMarkerClusterer implements OnInit, OnChanges, OnDestroy {
  private readonly _currentMarkers = new Set<Marker>();
  private readonly _ngZone = inject(NgZone);
  private readonly _closestMapEventManager = new MapEventManager(this._ngZone);
  private _markersSubscription = Subscription.EMPTY;

  /** Whether the clusterer is allowed to be initialized. */
  private readonly _canInitialize: boolean;

  /**
   * Used to customize how the marker cluster is rendered.
   * See https://googlemaps.github.io/js-markerclusterer/interfaces/Renderer.html.
   */
  @Input()
  renderer: Renderer;

  /**
   * Algorithm used to cluster the markers.
   * See https://googlemaps.github.io/js-markerclusterer/interfaces/Algorithm.html.
   */
  @Input()
  algorithm: Algorithm;

  /** Emits when clustering has started. */
  @Output() readonly clusteringbegin: Observable<void> =
    this._closestMapEventManager.getLazyEmitter<void>('clusteringbegin');

  /** Emits when clustering is done. */
  @Output() readonly clusteringend: Observable<void> =
    this._closestMapEventManager.getLazyEmitter<void>('clusteringend');

  /** Emits when a cluster has been clicked. */
  @Output()
  readonly clusterClick: EventEmitter<Cluster> = new EventEmitter<Cluster>();

  @ContentChildren(MapMarker, {descendants: true}) _markers: QueryList<MapMarker>;
  @ContentChildren(MapAdvancedMarker, {descendants: true})
  _advancedMarkers: QueryList<MapAdvancedMarker>;

  /** Underlying MarkerClusterer object used to interact with Google Maps. */
  markerClusterer?: MarkerClusterer;

  constructor(private readonly _googleMap: GoogleMap) {
    this._canInitialize = this._googleMap._isBrowser;
  }

  ngOnInit() {
    if (this._canInitialize) {
      this._init();
      // The `clusteringbegin` and `clusteringend` events are
      // emitted on the map so that's why set it as the target.
      this._closestMapEventManager.setTarget(this._googleMap.googleMap!);
    }
  }

  _init() {
    if (markerClusterer?.MarkerClusterer && this._googleMap.googleMap) {
      this._createCluster(this._googleMap.googleMap);
      this._watchForMarkerChanges();
    } else {
      this._ngZone.runOutsideAngular(() => {
        this._googleMap._resolveMap().then(map => {
          this._createCluster(map);
          this._watchForMarkerChanges();
        });
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['renderer'] || changes['algorithm'];

    // Since the options are set in the constructor, we have to recreate the cluster if they change.
    if (this.markerClusterer && this._googleMap.googleMap && change && !change.isFirstChange()) {
      this._createCluster(this._googleMap.googleMap);
      this._watchForMarkerChanges();
    }
  }

  ngOnDestroy() {
    this._markersSubscription.unsubscribe();
    this._closestMapEventManager.destroy();
    this._destroyCluster();
  }

  private _watchForMarkerChanges() {
    this._assertInitialized();
    const initialMarkers: Marker[] = [];
    const mapMarkerComponent = [
      ...this._markers.toArray(),
      this._advancedMarkers.toArray(),
    ] as MapMarkerComponent[];
    for (const marker of this._getInternalMarkers(mapMarkerComponent)) {
      this._currentMarkers.add(marker);
      initialMarkers.push(marker);
    }
    this.markerClusterer.addMarkers(initialMarkers);

    this._markersSubscription.unsubscribe();
    this._markersSubscription = merge(
      this._markers.changes,
      this._advancedMarkers.changes,
    ).subscribe((markerComponents: MapMarker[] | MapAdvancedMarker[]) => {
      this._assertInitialized();
      const newMarkers = new Set<Marker>(this._getInternalMarkers(markerComponents));
      const markersToAdd: Marker[] = [];
      const markersToRemove: Marker[] = [];
      for (const marker of Array.from(newMarkers)) {
        if (!this._currentMarkers.has(marker)) {
          this._currentMarkers.add(marker);
          markersToAdd.push(marker);
        }
      }
      for (const marker of Array.from(this._currentMarkers)) {
        if (!newMarkers.has(marker)) {
          markersToRemove.push(marker);
        }
      }
      this.markerClusterer.addMarkers(markersToAdd, true);
      this.markerClusterer.removeMarkers(markersToRemove, true);
      this.markerClusterer.render();
      for (const marker of markersToRemove) {
        this._currentMarkers.delete(marker);
      }
    });
  }

  private _createCluster(map: google.maps.Map | undefined) {
    if (
      !markerClusterer?.MarkerClusterer &&
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
      !map
    ) {
      throw Error(
        'MarkerClusterer class not found, cannot construct a marker cluster. ' +
          'Please install the MarkerClusterer library: ' +
          'https://github.com/googlemaps/js-markerclusterer',
      );
    }

    this._destroyCluster();

    // Create the object outside the zone so its events don't trigger change detection.
    // We'll bring it back in inside the `MapEventManager` only for the events that the
    // user has subscribed to.
    this._ngZone.runOutsideAngular(() => {
      this.markerClusterer = new markerClusterer.MarkerClusterer({
        map: map,
        renderer: this.renderer,
        algorithm: this.algorithm,
        onClusterClick: (event, cluster, map) => {
          if (this.clusterClick.observers.length) {
            this._ngZone.run(() => this.clusterClick.emit(cluster));
          } else {
            markerClusterer.defaultOnClusterClickHandler(event, cluster, map);
          }
        },
      });
    });
  }

  private _destroyCluster() {
    // TODO(crisbeto): the naming here seems odd, but the `MarkerCluster` method isn't
    // exposed. All this method seems to do at the time of writing is to call into `reset`.
    // See: https://github.com/googlemaps/js-markerclusterer/blob/main/src/markerclusterer.ts#L205
    this.markerClusterer?.onRemove();
    this.markerClusterer = undefined;
  }

  private _getInternalMarkers(markers: MapMarkerComponent[]): Marker[] {
    return markers
      .filter(markerComponent => {
        if (markerComponent instanceof MapMarker) {
          return markerComponent.marker!;
        }
        return markerComponent.advancedMarker!;
      })
      .map(markerComponent => {
        if (markerComponent instanceof MapMarker) {
          return markerComponent.marker!;
        }
        return markerComponent.advancedMarker!;
      });
  }

  private _assertInitialized(): asserts this is {markerClusterer: MarkerClusterer} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._googleMap.googleMap) {
        throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
            'Please wait for the API to load before trying to interact with it.',
        );
      }
      if (!this.markerClusterer) {
        throw Error(
          'Cannot interact with a MarkerClusterer before it has been initialized. ' +
            'Please wait for the MarkerClusterer to load before trying to interact with it.',
        );
      }
    }
  }
}
