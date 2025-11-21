/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

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
import {Observable, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';
import {MapMarker} from '../map-marker/map-marker';
import {
  AriaLabelFn,
  Calculator,
  Cluster,
  ClusterIconStyle,
  MarkerClusterer as MarkerClustererInstance,
  MarkerClustererOptions,
} from './deprecated-marker-clusterer-types';

/** Default options for a clusterer. */
const DEFAULT_CLUSTERER_OPTIONS: MarkerClustererOptions = {};

/**
 * The clusterer has to be defined and referred to as a global variable,
 * otherwise it'll cause issues when minified through Closure.
 */
declare const MarkerClusterer: typeof MarkerClustererInstance;

/**
 * Angular component for implementing a Google Maps Marker Clusterer.
 * See https://developers.google.com/maps/documentation/javascript/marker-clustering
 *
 * @deprecated This component is using a deprecated clustering implementation. Use the
 *   `map-marker-clusterer` component instead.
 * @breaking-change 21.0.0
 *
 */
@Component({
  selector: 'deprecated-map-marker-clusterer',
  exportAs: 'mapMarkerClusterer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content/>',
  encapsulation: ViewEncapsulation.None,
})
export class DeprecatedMapMarkerClusterer
  implements OnInit, AfterContentInit, OnChanges, OnDestroy
{
  private readonly _googleMap = inject(GoogleMap);
  private readonly _ngZone = inject(NgZone);
  private readonly _currentMarkers = new Set<google.maps.Marker>();
  private readonly _eventManager = new MapEventManager(inject(NgZone));
  private readonly _destroy = new Subject<void>();

  /** Whether the clusterer is allowed to be initialized. */
  private readonly _canInitialize = this._googleMap._isBrowser;

  @Input()
  ariaLabelFn: AriaLabelFn = () => '';

  @Input()
  set averageCenter(averageCenter: boolean) {
    this._averageCenter = averageCenter;
  }
  private _averageCenter: boolean;

  @Input() batchSize?: number;

  @Input()
  set batchSizeIE(batchSizeIE: number) {
    this._batchSizeIE = batchSizeIE;
  }
  private _batchSizeIE: number;

  @Input()
  set calculator(calculator: Calculator) {
    this._calculator = calculator;
  }
  private _calculator: Calculator;

  @Input()
  set clusterClass(clusterClass: string) {
    this._clusterClass = clusterClass;
  }
  private _clusterClass: string;

  @Input()
  set enableRetinaIcons(enableRetinaIcons: boolean) {
    this._enableRetinaIcons = enableRetinaIcons;
  }
  private _enableRetinaIcons: boolean;

  @Input()
  set gridSize(gridSize: number) {
    this._gridSize = gridSize;
  }
  private _gridSize: number;

  @Input()
  set ignoreHidden(ignoreHidden: boolean) {
    this._ignoreHidden = ignoreHidden;
  }
  private _ignoreHidden: boolean;

  @Input()
  set imageExtension(imageExtension: string) {
    this._imageExtension = imageExtension;
  }
  private _imageExtension: string;

  @Input()
  set imagePath(imagePath: string) {
    this._imagePath = imagePath;
  }
  private _imagePath: string;

  @Input()
  set imageSizes(imageSizes: number[]) {
    this._imageSizes = imageSizes;
  }
  private _imageSizes: number[];

  @Input()
  set maxZoom(maxZoom: number) {
    this._maxZoom = maxZoom;
  }
  private _maxZoom: number;

  @Input()
  set minimumClusterSize(minimumClusterSize: number) {
    this._minimumClusterSize = minimumClusterSize;
  }
  private _minimumClusterSize: number;

  @Input()
  set styles(styles: ClusterIconStyle[]) {
    this._styles = styles;
  }
  private _styles: ClusterIconStyle[];

  @Input()
  set title(title: string) {
    this._title = title;
  }
  private _title: string;

  @Input()
  set zIndex(zIndex: number) {
    this._zIndex = zIndex;
  }
  private _zIndex: number;

  @Input()
  set zoomOnClick(zoomOnClick: boolean) {
    this._zoomOnClick = zoomOnClick;
  }
  private _zoomOnClick: boolean;

  @Input()
  set options(options: MarkerClustererOptions) {
    this._options = options;
  }
  private _options: MarkerClustererOptions;

  /**
   * See
   * googlemaps.github.io/v3-utility-library/modules/
   * _google_markerclustererplus.html#clusteringbegin
   */
  @Output() readonly clusteringbegin: Observable<void> =
    this._eventManager.getLazyEmitter<void>('clusteringbegin');

  /**
   * See
   * googlemaps.github.io/v3-utility-library/modules/_google_markerclustererplus.html#clusteringend
   */
  @Output() readonly clusteringend: Observable<void> =
    this._eventManager.getLazyEmitter<void>('clusteringend');

  /** Emits when a cluster has been clicked. */
  @Output()
  readonly clusterClick: Observable<Cluster> = this._eventManager.getLazyEmitter<Cluster>('click');

  @ContentChildren(MapMarker, {descendants: true}) _markers: QueryList<MapMarker>;

  /**
   * The underlying MarkerClusterer object.
   *
   * See
   * googlemaps.github.io/v3-utility-library/classes/
   * _google_markerclustererplus.markerclusterer.html
   */
  markerClusterer?: MarkerClustererInstance;

  /** Event emitted when the clusterer is initialized. */
  @Output() readonly markerClustererInitialized: EventEmitter<MarkerClustererInstance> =
    new EventEmitter<MarkerClustererInstance>();

  constructor(...args: unknown[]);
  constructor() {}

  ngOnInit() {
    if (this._canInitialize) {
      this._ngZone.runOutsideAngular(() => {
        this._googleMap._resolveMap().then(map => {
          if (
            typeof MarkerClusterer !== 'function' &&
            (typeof ngDevMode === 'undefined' || ngDevMode)
          ) {
            throw Error(
              'MarkerClusterer class not found, cannot construct a marker cluster. ' +
                'Please install the MarkerClustererPlus library: ' +
                'https://github.com/googlemaps/js-markerclustererplus',
            );
          }

          // Create the object outside the zone so its events don't trigger change detection.
          // We'll bring it back in inside the `MapEventManager` only for the events that the
          // user has subscribed to.
          this.markerClusterer = this._ngZone.runOutsideAngular(() => {
            return new MarkerClusterer(map, [], this._combineOptions());
          });

          this._assertInitialized();
          this._eventManager.setTarget(this.markerClusterer);
          this.markerClustererInitialized.emit(this.markerClusterer);
        });
      });
    }
  }

  ngAfterContentInit() {
    if (this._canInitialize) {
      if (this.markerClusterer) {
        this._watchForMarkerChanges();
      } else {
        this.markerClustererInitialized
          .pipe(take(1), takeUntil(this._destroy))
          .subscribe(() => this._watchForMarkerChanges());
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const {
      markerClusterer: clusterer,
      ariaLabelFn,
      _averageCenter,
      _batchSizeIE,
      _calculator,
      _styles,
      _clusterClass,
      _enableRetinaIcons,
      _gridSize,
      _ignoreHidden,
      _imageExtension,
      _imagePath,
      _imageSizes,
      _maxZoom,
      _minimumClusterSize,
      _title,
      _zIndex,
      _zoomOnClick,
    } = this;

    if (clusterer) {
      if (changes['options']) {
        clusterer.setOptions(this._combineOptions());
      }
      if (changes['ariaLabelFn']) {
        clusterer.ariaLabelFn = ariaLabelFn;
      }
      if (changes['averageCenter'] && _averageCenter !== undefined) {
        clusterer.setAverageCenter(_averageCenter);
      }
      if (changes['batchSizeIE'] && _batchSizeIE !== undefined) {
        clusterer.setBatchSizeIE(_batchSizeIE);
      }
      if (changes['calculator'] && !!_calculator) {
        clusterer.setCalculator(_calculator);
      }
      if (changes['clusterClass'] && _clusterClass !== undefined) {
        clusterer.setClusterClass(_clusterClass);
      }
      if (changes['enableRetinaIcons'] && _enableRetinaIcons !== undefined) {
        clusterer.setEnableRetinaIcons(_enableRetinaIcons);
      }
      if (changes['gridSize'] && _gridSize !== undefined) {
        clusterer.setGridSize(_gridSize);
      }
      if (changes['ignoreHidden'] && _ignoreHidden !== undefined) {
        clusterer.setIgnoreHidden(_ignoreHidden);
      }
      if (changes['imageExtension'] && _imageExtension !== undefined) {
        clusterer.setImageExtension(_imageExtension);
      }
      if (changes['imagePath'] && _imagePath !== undefined) {
        clusterer.setImagePath(_imagePath);
      }
      if (changes['imageSizes'] && _imageSizes) {
        clusterer.setImageSizes(_imageSizes);
      }
      if (changes['maxZoom'] && _maxZoom !== undefined) {
        clusterer.setMaxZoom(_maxZoom);
      }
      if (changes['minimumClusterSize'] && _minimumClusterSize !== undefined) {
        clusterer.setMinimumClusterSize(_minimumClusterSize);
      }
      if (changes['styles'] && _styles) {
        clusterer.setStyles(_styles);
      }
      if (changes['title'] && _title !== undefined) {
        clusterer.setTitle(_title);
      }
      if (changes['zIndex'] && _zIndex !== undefined) {
        clusterer.setZIndex(_zIndex);
      }
      if (changes['zoomOnClick'] && _zoomOnClick !== undefined) {
        clusterer.setZoomOnClick(_zoomOnClick);
      }
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._eventManager.destroy();
    this.markerClusterer?.setMap(null);
  }

  fitMapToMarkers(padding: number | google.maps.Padding) {
    this._assertInitialized();
    this.markerClusterer.fitMapToMarkers(padding);
  }

  getAverageCenter(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getAverageCenter();
  }

  getBatchSizeIE(): number {
    this._assertInitialized();
    return this.markerClusterer.getBatchSizeIE();
  }

  getCalculator(): Calculator {
    this._assertInitialized();
    return this.markerClusterer.getCalculator();
  }

  getClusterClass(): string {
    this._assertInitialized();
    return this.markerClusterer.getClusterClass();
  }

  getClusters(): Cluster[] {
    this._assertInitialized();
    return this.markerClusterer.getClusters();
  }

  getEnableRetinaIcons(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getEnableRetinaIcons();
  }

  getGridSize(): number {
    this._assertInitialized();
    return this.markerClusterer.getGridSize();
  }

  getIgnoreHidden(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getIgnoreHidden();
  }

  getImageExtension(): string {
    this._assertInitialized();
    return this.markerClusterer.getImageExtension();
  }

  getImagePath(): string {
    this._assertInitialized();
    return this.markerClusterer.getImagePath();
  }

  getImageSizes(): number[] {
    this._assertInitialized();
    return this.markerClusterer.getImageSizes();
  }

  getMaxZoom(): number {
    this._assertInitialized();
    return this.markerClusterer.getMaxZoom();
  }

  getMinimumClusterSize(): number {
    this._assertInitialized();
    return this.markerClusterer.getMinimumClusterSize();
  }

  getStyles(): ClusterIconStyle[] {
    this._assertInitialized();
    return this.markerClusterer.getStyles();
  }

  getTitle(): string {
    this._assertInitialized();
    return this.markerClusterer.getTitle();
  }

  getTotalClusters(): number {
    this._assertInitialized();
    return this.markerClusterer.getTotalClusters();
  }

  getTotalMarkers(): number {
    this._assertInitialized();
    return this.markerClusterer.getTotalMarkers();
  }

  getZIndex(): number {
    this._assertInitialized();
    return this.markerClusterer.getZIndex();
  }

  getZoomOnClick(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getZoomOnClick();
  }

  private _combineOptions(): MarkerClustererOptions {
    const options = this._options || DEFAULT_CLUSTERER_OPTIONS;
    return {
      ...options,
      ariaLabelFn: this.ariaLabelFn ?? options.ariaLabelFn,
      averageCenter: this._averageCenter ?? options.averageCenter,
      batchSize: this.batchSize ?? options.batchSize,
      batchSizeIE: this._batchSizeIE ?? options.batchSizeIE,
      calculator: this._calculator ?? options.calculator,
      clusterClass: this._clusterClass ?? options.clusterClass,
      enableRetinaIcons: this._enableRetinaIcons ?? options.enableRetinaIcons,
      gridSize: this._gridSize ?? options.gridSize,
      ignoreHidden: this._ignoreHidden ?? options.ignoreHidden,
      imageExtension: this._imageExtension ?? options.imageExtension,
      imagePath: this._imagePath ?? options.imagePath,
      imageSizes: this._imageSizes ?? options.imageSizes,
      maxZoom: this._maxZoom ?? options.maxZoom,
      minimumClusterSize: this._minimumClusterSize ?? options.minimumClusterSize,
      styles: this._styles ?? options.styles,
      title: this._title ?? options.title,
      zIndex: this._zIndex ?? options.zIndex,
      zoomOnClick: this._zoomOnClick ?? options.zoomOnClick,
    };
  }

  private _watchForMarkerChanges() {
    this._assertInitialized();

    this._ngZone.runOutsideAngular(() => {
      this._getInternalMarkers(this._markers).then(markers => {
        const initialMarkers: google.maps.Marker[] = [];
        for (const marker of markers) {
          this._currentMarkers.add(marker);
          initialMarkers.push(marker);
        }
        this.markerClusterer.addMarkers(initialMarkers);
      });
    });

    this._markers.changes
      .pipe(takeUntil(this._destroy))
      .subscribe((markerComponents: MapMarker[]) => {
        this._assertInitialized();
        this._ngZone.runOutsideAngular(() => {
          this._getInternalMarkers(markerComponents).then(markers => {
            const newMarkers = new Set(markers);
            const markersToAdd: google.maps.Marker[] = [];
            const markersToRemove: google.maps.Marker[] = [];
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
            this.markerClusterer.repaint();
            for (const marker of markersToRemove) {
              this._currentMarkers.delete(marker);
            }
          });
        });
      });
  }

  private _getInternalMarkers(
    markers: MapMarker[] | QueryList<MapMarker>,
  ): Promise<google.maps.Marker[]> {
    return Promise.all(markers.map(markerComponent => markerComponent._resolveMarker()));
  }

  private _assertInitialized(): asserts this is {markerClusterer: MarkerClustererInstance} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this.markerClusterer) {
        throw Error(
          'Cannot interact with a MarkerClusterer before it has been initialized. ' +
            'Please wait for the MarkerClusterer to load before trying to interact with it.',
        );
      }
    }
  }
}
