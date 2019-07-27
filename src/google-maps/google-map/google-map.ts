import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {take} from 'rxjs/operators';

/**
 * Angular component that renders a Google Map via the Google Maps JavaScript
 * API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 */
@Component({
  selector: 'google-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div #map></div>',
})
export class GoogleMap implements OnInit {
  @Input() height = '500px';
  @Input() width = '500px';
  // TODO(mbehrlich): add options, handlers, properties, and methods.

  @ViewChild('map', {static: true}) set mapEl(mapEl: ElementRef) {
    this._mapEl$.next(mapEl);
  }

  private readonly _mapEl$ = new ReplaySubject<ElementRef>(1);
  private readonly _map$ = new ReplaySubject<google.maps.Map>(1);

  ngOnInit() {
    // default options for now
    const options: google.maps.MapOptions = {
      center: {lat: 50, lng: 50},
      zoom: 4,
    };

    this._mapEl$.pipe(take(1)).subscribe(mapElRef => {
      const mapEl = mapElRef.nativeElement;
      mapEl.style.height = this.height;
      mapEl.style.width = this.width;
      const map = new google.maps.Map(mapEl, options);
      this._map$.next(map);
    });
  }
}
