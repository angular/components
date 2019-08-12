import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

interface GoogleMapsWindow extends Window {
  google?: typeof google;
}

/** default options set to the Googleplex */
export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  center: {lat: 37.421995, lng: -122.084092},
  zoom: 17,
};

/** Arbitrarily chose default height for the map element */
export const DEFAULT_HEIGHT = '500px';
/** Arbitrarily chose default width for the map element */
export const DEFAULT_WIDTH = '500px';

/**
 * Angular component that renders a Google Map via the Google Maps JavaScript
 * API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 */
@Component({
  selector: 'google-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="map-container"></div>',
})
export class GoogleMap implements OnInit, OnDestroy {
  @Input()
  set height(height: string) {
    this._height$.next(height || DEFAULT_HEIGHT);
  }

  @Input()
  set width(width: string) {
    this._width$.next(width || DEFAULT_WIDTH);
  }

  @Input()
  set center(center: google.maps.LatLngLiteral) {
    this._center$.next(center);
  }
  @Input()
  set zoom(zoom: number) {
    this._zoom$.next(zoom);
  }
  @Input()
  set options(options: google.maps.MapOptions) {
    this._options$.next(options || DEFAULT_OPTIONS);
  }

  // TODO(mbehrlich): Add event handlers, properties, and methods.

  private readonly _height$ = new BehaviorSubject<string>(DEFAULT_HEIGHT);
  private readonly _width$ = new BehaviorSubject<string>(DEFAULT_WIDTH);
  private readonly _options$ = new BehaviorSubject<google.maps.MapOptions>(DEFAULT_OPTIONS);
  private readonly _center$ = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _zoom$ = new BehaviorSubject<number|undefined>(undefined);

  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _elementRef: ElementRef) {
    const googleMapsWindow: GoogleMapsWindow = window;
    if (!googleMapsWindow.google) {
      throw new Error(
          'Namespace google not found, cannot construct embedded google ' +
          'map. Please install the Google Maps JavaScript API: ' +
          'https://developers.google.com/maps/documentation/javascript/' +
          'tutorial#Loading_the_Maps_API');
    }
  }

  ngOnInit() {
    const mapEl = this._elementRef.nativeElement.querySelector('.map-container');

    const combinedOptions$: Observable<google.maps.MapOptions> =
        combineLatest(this._options$, this._center$, this._zoom$)
            .pipe(map(([options, center, zoom]) => {
              const combinedOptions: google.maps.MapOptions = {
                ...options,
                center: center || options.center,
                zoom: zoom !== undefined ? zoom : options.zoom,
              };
              if (!combinedOptions.center || !combinedOptions.center.lat ||
                  !combinedOptions.center.lng || !combinedOptions.zoom) {
                throw new Error(
                    'The MapOptions object is not configured correctly. ' +
                    'See the Google Maps JavaScript API: ' +
                    'https://developers.google.com/maps/documentation/javascript/' +
                    'reference/map#MapOptions');
              }
              return combinedOptions;
            }));
    const googleMap$ =
        combinedOptions$.pipe(take(1), map(options => new google.maps.Map(mapEl, options)));

    googleMap$.subscribe();

    combineLatest(googleMap$, combinedOptions$)
        .pipe(takeUntil(this._destroy$))
        .subscribe(([googleMap, options]) => {
          googleMap.setOptions(options);
        });

    combineLatest(this._height$, this._width$)
        .pipe(takeUntil(this._destroy$))
        .subscribe(([height, width]) => {
          mapEl.style.height = height;
          mapEl.style.width = width;
        });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
