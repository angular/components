import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {ReplaySubject} from 'rxjs';

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
  // Arbitrarily chosen default size
  @Input() height = '500px';
  @Input() width = '500px';

  // TODO(mbehrlich): add options, handlers, properties, and methods.

  @ViewChild('map', {static: true}) mapElRef: ElementRef;

  private readonly _map$ = new ReplaySubject<google.maps.Map>(1);

  ngOnInit() {
    // default options for now
    const options: google.maps.MapOptions = {
      center: {lat: 41.890150, lng: 12.492231},
      zoom: 16,
    };


    const mapEl = this.mapElRef.nativeElement;
    mapEl.style.height = this.height;
    mapEl.style.width = this.width;
    const map = new google.maps.Map(mapEl, options);
    this._map$.next(map);
  }
}
