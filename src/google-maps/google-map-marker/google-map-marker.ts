import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

export const DEFAULT_OPTIONS = {
  position: { lat: 37.421995, lng: -122.084092 },
};

/**
 * Angular component that renders a Google Maps marker via the Google Maps JavaScript API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/marker
 */
@Component({
  selector: 'google-map-marker',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleMapMarker implements OnInit, OnDestroy {
  @Input() set options(options: google.maps.MarkerOptions) {
    this._options.next(options || DEFAULT_OPTIONS);
  }

  @Input() set title(title: string) {
    this._title.next(title);
  }

  @Input() set position(position: google.maps.LatLngLiteral) {
    this._position.next(position);
  }

  @Input() set label(label: string|google.maps.MarkerLabel) {
    this._label.next(label);
  }

  @Input() set clickable(clickable: boolean) {
    this._clickable.next(clickable);
  }

  /** */
  @Output() animationChanged = new EventEmitter<void>();

  /** */
  @Output() mapClick = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() clickableChanged = new EventEmitter<void>();

  /** */
  @Output() cursorChanged = new EventEmitter<void>();

  /** */
  @Output() mapDblclick = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() mapDrag = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() mapDragend = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() draggableChanged = new EventEmitter<void>();

  /** */
  @Output() mapDragstart = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() flatChanged = new EventEmitter<void>();

  /** */
  @Output() iconChanged = new EventEmitter<void>();

  /** */
  @Output() mapMousedown = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() mapMouseout = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() mapMouseover = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() mapMouseup = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() positionChanged = new EventEmitter<void>();

  /** */
  @Output() mapRightclick = new EventEmitter<google.maps.MouseEvent>();

  /** */
  @Output() shapeChanged = new EventEmitter<void>();

  /** */
  @Output() titleChanged = new EventEmitter<void>();

  /** */
  @Output() visibleChanged = new EventEmitter<void>();

  /** */
  @Output() zindexChanged = new EventEmitter<void>();

  private readonly _options = new BehaviorSubject<google.maps.MarkerOptions>(DEFAULT_OPTIONS);
  private readonly _title = new BehaviorSubject<string|undefined>(undefined);
  private readonly _position = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _label = new BehaviorSubject<string|google.maps.MarkerLabel|undefined>(undefined);
  private readonly _clickable = new BehaviorSubject<boolean>(true);

  private readonly _map = new ReplaySubject<google.maps.Map>(1);

  private readonly _destroy = new Subject<void>();

  private readonly _listeners: google.maps.MapsEventListener[] = [];

  private _marker?: google.maps.Marker;
  private _hasMap = false;

  ngOnInit() {
    const combinedOptionsChanges = this._combineOptions();

    combineLatest(this._map, combinedOptionsChanges).pipe(takeUntil(this._destroy)).subscribe(([map, options]) => {
      if (this._marker) {
        this._marker.setOptions(options);
      } else {
        this._marker = new google.maps.Marker(options);
        this._marker.setMap(map);
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
    if (this._marker) {
      this._marker.setMap(null);
    }
  }

  setMap(map: google.maps.Map) {
    if (!this._hasMap) {
      this._map.next(map);
      this._hasMap = true;
    }
  }

  getAnimation(): google.maps.Animation|null {
    return this._marker!.getAnimation() || null;
  }

  getClickable(): boolean {
    return this._marker!.getClickable();
  }

  getCursor(): string|null {
    return this._marker!.getCursor() || null;
  }

  getDraggable(): boolean {
    return !!this._marker!.getDraggable();
  }

  getIcon(): string|google.maps.Icon|google.maps.Symbol|null {
    return this._marker!.getIcon() || null;
  }

  getLabel(): google.maps.MarkerLabel|null {
    return this._marker!.getLabel() || null;
  }

  getOpacity(): number|null {
    return this._marker!.getOpacity() || null;
  }

  getPosition(): google.maps.LatLng|null {
    return this._marker!.getPosition() || null;
  }

  getShape(): google.maps.MarkerShape|null {
    return this._marker!.getShape() || null;
  }

  getTitle(): string|null {
    return this._marker!.getTitle() || null;
  }

  getVisible(): boolean {
    return this._marker!.getVisible();
  }

  getZIndex(): number|null {
    return this._marker!.getZIndex() || null;
  }

  private _combineOptions(): Observable<google.maps.MarkerOptions> {
    return combineLatest(this._options, this._title, this._position, this._label, this._clickable, this._map)
      .pipe(map(([options, title, position, label, clickable, map]) => {
        const combinedOptions: google.maps.MarkerOptions = {
          ...options,
          title: title || options.title,
          position: position || options.position,
          label: label || options.label,
          clickable: clickable || options.clickable,
          map: map || null,
        };
        return combinedOptions;
      }));
  }

  private _initializeEventHandlers() {
    const eventHandlers = new Map<string, EventEmitter<void>>([]);
    const mouseEventHandlers = new Map<string, EventEmitter<google.maps.MouseEvent>>([]);

    eventHandlers.forEach((eventHandler: EventEmitter<void>, name: string) => {
      if (eventHandler.observers.length > 0) {
        this._listeners.push(this._marker!.addListener(name, () => {
          eventHandler.emit();
        }));
      }
    });
    mouseEventHandlers.forEach((eventHandler: EventEmitter<google.maps.MouseEvent>, name: string) => {
      if (eventHandler.observers.length > 0) {
        this._listeners.push(this._marker!.addListener(name, (event: google.maps.MouseEvent) => {
          eventHandler.emit(event);
        }));
      }
    });
  }
}
