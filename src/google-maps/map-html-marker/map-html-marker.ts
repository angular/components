import {ContentObserver} from '../../cdk/observers';
import {Directive, ElementRef, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GoogleMap} from '../google-map/google-map';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {filter, finalize, map, startWith, take, takeUntil} from 'rxjs/operators';

import {HTMLMarkerOptions, HTMLMarker} from './html-marker';

/**
 * Angular component that renders any HTML element via the Google Maps JavaScript API on
 * the interactive layer of google maps. This directive does not output any events; To listen
 * to events use `(click)`, `@HostListener()`, or `host` attribute of component definition.
 *
 * **Warning:** Creating HTML marker is more expensive than using `<map-maker>`.
 * ```html
 * <google-map>
 *   <app-marker html-marker [position]="position"></app-marker>
 *   <div html-marker [position]="position2" (click)="markerClicked($event)"></div>
 * </google-map>
 * ```
 *
 * Implemented according to
 * @see developers.google.com/maps/documentation/javascript/customoverlays
 */
@Directive({
  selector: '[html-marker]',
})
export class MapHTMLMarker implements OnInit, OnDestroy {
  private readonly _position =
    new BehaviorSubject<google.maps.LatLngLiteral|google.maps.LatLng|undefined>(undefined);
  private readonly _destroy = new Subject<void>();
  private _content: Observable<HTMLElement>;
  private _marker?: HTMLMarker;

  @Input()
  set position(position: google.maps.LatLngLiteral|google.maps.LatLng) {
    this._position.next(position);
  }

  constructor(
    private readonly _googleMap: GoogleMap,
    private _ngZone: NgZone,
    elementRef: ElementRef<HTMLElement>,
    contentObserver: ContentObserver,
  ) {
    const parentEl = elementRef.nativeElement.parentElement;
    this._content = contentObserver.observe(elementRef).pipe(
      takeUntil(this._destroy),
      map(_ => elementRef.nativeElement),
      startWith(elementRef.nativeElement),
      filter((el): el is HTMLElement => !!el),
      finalize(() => {
        // 	Possibly might be omitted
        if (parentEl && elementRef.nativeElement) {
          parentEl.append(elementRef.nativeElement);
        }
      }),
    );
  }

  ngOnInit(): void {
    if (this._googleMap._isBrowser) {
      const combinedOptionsChanges = this._combineOptions();

      combinedOptionsChanges.pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        // We'll bring it back in inside the `MapEventManager` only for the events that the
        // user has subscribed to.
        this._ngZone.runOutsideAngular(() => this._marker = new HTMLMarker(options));
        this._marker!.setMap(this._googleMap._googleMap);
      });

      this._watchForPositionChanges();
    }
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
    if (this._marker) {
      this._marker.setMap(null);
    }
  }

  _combineOptions(): Observable<HTMLMarkerOptions> {
    return combineLatest([
      this._content,
      this._position.pipe(
        filter((position): position is google.maps.LatLng => !!position),
      ),
    ]).pipe(
      map(([content, position]): HTMLMarkerOptions => ({ content, position })),
    );
  }

  _watchForPositionChanges() {
    this._position.pipe(takeUntil(this._destroy)).subscribe(position => {
      if (this._marker && position) {
        this._marker.setPosition(position);
      }
    });
  }

}
