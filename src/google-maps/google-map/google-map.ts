import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, shareReplay, take, takeUntil} from 'rxjs/operators';

interface GoogleMapsWindow extends Window {
  google?: typeof google;
}

/**
 * Extends the Google Map interface due to the Definitely Typed implementation
 * missing "getClickableIcons".
 */
export interface UpdatedGoogleMap extends google.maps.Map {
  getClickableIcons: () => boolean;
}

/** default options set to the Googleplex */
export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  center: {lat: 37.421995, lng: -122.084092},
  zoom: 17,
};

/** Arbitrary default height for the map element */
export const DEFAULT_HEIGHT = '500px';
/** Arbitrary default width for the map element */
export const DEFAULT_WIDTH = '500px';

/**
 * Angular component that renders a Google Map via the Google Maps JavaScript
 * API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 */
@Component({
  selector: 'google-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'google-map.html',
})
export class GoogleMap implements OnChanges, OnInit, OnDestroy {
  @Input() height = DEFAULT_HEIGHT;

  @Input() width = DEFAULT_WIDTH;

  @Input()
  set center(center: google.maps.LatLngLiteral) {
    this._center.next(center);
  }
  @Input()
  set zoom(zoom: number) {
    this._zoom.next(zoom);
  }
  @Input()
  set options(options: google.maps.MapOptions) {
    this._options.next(options || DEFAULT_OPTIONS);
  }

  @Output() boundsChanged = new EventEmitter<void>();
  @Output() centerChanged = new EventEmitter<void>();
  @Output() click = new EventEmitter<google.maps.MouseEvent|google.maps.IconMouseEvent>();
  @Output() dblclick = new EventEmitter<google.maps.MouseEvent>();
  @Output() drag = new EventEmitter<void>();
  @Output() dragend = new EventEmitter<void>();
  @Output() dragstart = new EventEmitter<void>();
  @Output() headingChanged = new EventEmitter<void>();
  @Output() idle = new EventEmitter<void>();
  @Output() maptypeidChanged = new EventEmitter<void>();
  @Output() mousemove = new EventEmitter<google.maps.MouseEvent>();
  @Output() mouseout = new EventEmitter<google.maps.MouseEvent>();
  @Output() mouseover = new EventEmitter<google.maps.MouseEvent>();
  @Output() projectionChanged = new EventEmitter<void>();
  @Output() rightclick = new EventEmitter<google.maps.MouseEvent>();
  @Output() tilesloaded = new EventEmitter<void>();
  @Output() tiltChanged = new EventEmitter<void>();
  @Output() zoomChanged = new EventEmitter<void>();

  private _mapEl: HTMLElement;
  private _googleMap!: UpdatedGoogleMap;

  private readonly _listeners: google.maps.MapsEventListener[] = [];

  private readonly _options = new BehaviorSubject<google.maps.MapOptions>(DEFAULT_OPTIONS);
  private readonly _center = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _zoom = new BehaviorSubject<number|undefined>(undefined);

  private readonly _destroy = new Subject<void>();

  constructor(private readonly _elementRef: ElementRef) {
    const googleMapsWindow: GoogleMapsWindow = window;
    if (!googleMapsWindow.google) {
      throw Error(
          'Namespace google not found, cannot construct embedded google ' +
          'map. Please install the Google Maps JavaScript API: ' +
          'https://developers.google.com/maps/documentation/javascript/' +
          'tutorial#Loading_the_Maps_API');
    }
  }

  ngOnChanges() {
    this._setSize();
  }

  ngOnInit() {
    this._mapEl = this._elementRef.nativeElement.querySelector('.map-container')!;
    this._setSize();

    const combinedOptionsChanges = this._combineOptions();

    const googleMapChanges = this._initializeMap(combinedOptionsChanges);
    googleMapChanges.subscribe((googleMap: google.maps.Map) => {
      this._googleMap = googleMap as UpdatedGoogleMap;
      this._initializeEventHandlers();
    });

    this._watchForOptionsChanges(googleMapChanges, combinedOptionsChanges);
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    for (let listener of this._listeners) {
      listener.remove();
    }
  }

  fitBounds(
      bounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._googleMap.fitBounds(bounds, padding);
  }

  panBy(x: number, y: number) {
    this._googleMap.panBy(x, y);
  }

  panTo(latLng: google.maps.LatLng|google.maps.LatLngLiteral) {
    this._googleMap.panTo(latLng);
  }

  panToBounds(
      latLngBounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._googleMap.panToBounds(latLngBounds, padding);
  }

  getBounds(): google.maps.LatLngBounds|null {
    return this._googleMap.getBounds() || null;
  }

  getCenter(): google.maps.LatLng {
    return this._googleMap.getCenter();
  }

  getClickableIcons(): boolean {
    return this._googleMap.getClickableIcons();
  }

  getHeading(): number {
    return this._googleMap.getHeading();
  }

  getMapTypeId(): google.maps.MapTypeId|string {
    return this._googleMap.getMapTypeId();
  }

  getProjection(): google.maps.Projection|null {
    return this._googleMap.getProjection();
  }

  getStreetView(): google.maps.StreetViewPanorama {
    return this._googleMap.getStreetView();
  }

  getTilt(): number {
    return this._googleMap.getTilt();
  }

  getZoom(): number {
    return this._googleMap.getZoom();
  }

  get controls(): Array<google.maps.MVCArray<Node>> {
    return this._googleMap.controls;
  }

  get data(): google.maps.Data {
    return this._googleMap.data;
  }

  get mapTypes(): google.maps.MapTypeRegistry {
    return this._googleMap.mapTypes;
  }

  get overlayMapTypes(): google.maps.MVCArray<google.maps.MapType> {
    return this._googleMap.overlayMapTypes;
  }

  private _setSize() {
    if (this._mapEl) {
      this._mapEl.style.height = this.height || DEFAULT_HEIGHT;
      this._mapEl.style.width = this.width || DEFAULT_WIDTH;
    }
  }

  /** Combines the center and zoom and the other map options into a single object */
  private _combineOptions(): Observable<google.maps.MapOptions> {
    return combineLatest(this._options, this._center, this._zoom)
        .pipe(map(([options, center, zoom]) => {
          const combinedOptions: google.maps.MapOptions = {
            ...options,
            center: center || options.center,
            zoom: zoom !== undefined ? zoom : options.zoom,
          };
          return combinedOptions;
        }));
  }

  private _initializeMap(optionsChanges: Observable<google.maps.MapOptions>):
      Observable<google.maps.Map> {
    return optionsChanges.pipe(
        take(1), map(options => {
          return new google.maps.Map(this._mapEl, options);
        }),
        shareReplay(1));
  }

  private _watchForOptionsChanges(
      googleMapChanges: Observable<google.maps.Map>,
      optionsChanges: Observable<google.maps.MapOptions>) {
    combineLatest(googleMapChanges, optionsChanges)
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, options]) => {
          googleMap.setOptions(options);
        });
  }

  private _initializeEventHandlers() {
    const eventHandlers = new Map<string, EventEmitter<void>>([
      ['bounds_changed', this.boundsChanged], ['center_changed', this.centerChanged],
      ['drag', this.drag], ['dragend', this.dragend], ['dragstart', this.dragstart],
      ['heading_changed', this.headingChanged], ['idle', this.idle],
      ['maptypeid_changed', this.maptypeidChanged], ['projection_changed', this.projectionChanged],
      ['tilesloaded', this.tilesloaded], ['tilt_changed', this.tiltChanged],
      ['zoomChanged', this.zoomChanged]
    ]);
    const mouseEventHandlers = new Map<string, EventEmitter<google.maps.MouseEvent>>([
      ['dblclick', this.dblclick],
      ['mousemove', this.mousemove],
      ['mouseout', this.mouseout],
      ['mouseover', this.mouseover],
      ['rightclick', this.rightclick],
    ]);
    eventHandlers.forEach((eventHandler: EventEmitter<void>, name: string) => {
      if (eventHandler.observers.length > 0) {
        this._listeners.push(this._googleMap.addListener(name, () => {
          eventHandler.emit();
        }));
      }
    });
    mouseEventHandlers.forEach(
        (eventHandler: EventEmitter<google.maps.MouseEvent>, name: string) => {
          if (eventHandler.observers.length > 0) {
            this._listeners.push(
                this._googleMap.addListener(name, (event: google.maps.MouseEvent) => {
                  eventHandler.emit(event);
                }));
          }
        });
    if (this.click.observers.length > 0) {
      this._listeners.push(this._googleMap.addListener(
          'click', (event: google.maps.MouseEvent|google.maps.IconMouseEvent) => {
            this.click.emit(event);
          }));
    }
  }
}
