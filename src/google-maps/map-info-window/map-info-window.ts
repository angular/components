import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {MapMarker} from '../map-marker/index';

/**
 * Angular component that renders a Google Maps info window via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/info-window
 */
@Component({
  selector: 'map-info-window',
  template: `<div #infoWindowContent class="map-info-window-content">
               <ng-content></ng-content>
             </div>`,
  styleUrls: ['map-info-window.css'],
})
export class MapInfoWindow implements OnInit, OnDestroy {
  @Input()
  set options(options: google.maps.InfoWindowOptions) {
    this._options.next(options || {});
  }

  @Input()
  set position(position: google.maps.LatLngLiteral) {
    this._position.next(position);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.closeclick
   */
  @Output() closeclick = new EventEmitter<void>();

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.content_changed
   */
  @Output() contentChanged = new EventEmitter<void>();

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.domready
   */
  @Output() domready = new EventEmitter<void>();

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.position_changed
   */
  @Output() positionChanged = new EventEmitter<void>();

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.zindex_changed
   */
  @Output() zindexChanged = new EventEmitter<void>();

  @ViewChild('infoWindowContent', {static: false})
  set content(content: ElementRef) {
    this._content.next(content.nativeElement);
  }

  private readonly _options = new BehaviorSubject<google.maps.InfoWindowOptions>({});
  private readonly _position = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _content = new ReplaySubject<Node>(1);

  private readonly _listeners: google.maps.MapsEventListener[] = [];

  private readonly _destroy = new Subject<void>();

  private _map?: google.maps.Map;
  private _infoWindow?: google.maps.InfoWindow;

  ngOnInit() {
    this._combineOptions().pipe(takeUntil(this._destroy)).subscribe(options => {
      if (this._infoWindow) {
        this._infoWindow.setOptions(options);
      } else {
        this._infoWindow = new google.maps.InfoWindow(options);
        this._initializeEventHandlers();
      }
    });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    for (let listener of this._listeners) {
      listener.remove();
    }
    this.close();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.close
   */
  close() {
    if (this._infoWindow) {
      this._infoWindow.close();
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getContent
   */
  getContent(): string|Node {
    return this._infoWindow!.getContent();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.getPosition
   */
  getPosition(): google.maps.LatLng|null {
    return this._infoWindow!.getPosition() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getZIndex
   */
  getZIndex(): number {
    return this._infoWindow!.getZIndex();
  }

  /**
   * Opens the MapInfoWindow using the provided MapMarker as the anchor. If the anchor is not set,
   * then the position property of the options input is used instead.
   */
  open(anchor?: MapMarker) {
    const marker = anchor ? anchor._marker : undefined;
    if (this._map) {
      this._infoWindow!.open(this._map, marker);
    }
  }

  _setMap(googleMap: google.maps.Map) {
    if (!this._map) {
      this._map = googleMap;
    }
  }

  private _combineOptions(): Observable<google.maps.InfoWindowOptions> {
    return combineLatest(this._options, this._position, this._content)
        .pipe(map(([options, position, content]) => {
          const combinedOptions: google.maps.InfoWindowOptions = {
            ...options,
            position: position || options.position,
            content,
          };
          return combinedOptions;
        }));
  }

  private _initializeEventHandlers() {
    const eventHandlers = new Map<string, EventEmitter<void>>([
      ['closeclick', this.closeclick],
      ['content_changed', this.contentChanged],
      ['domready', this.domready],
      ['position_changed', this.positionChanged],
      ['zindex_changed', this.zindexChanged],
    ]);
    eventHandlers.forEach((eventHandler: EventEmitter<void>, name: string) => {
      if (eventHandler.observers.length > 0) {
        this._listeners.push(this._infoWindow!.addListener(name, () => {
          eventHandler.emit();
        }));
      }
    });
  }
}
