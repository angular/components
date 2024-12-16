import {Component} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  createTransitLayerConstructorSpy,
  createTransitLayerSpy,
} from '../testing/fake-google-map-utils';

import {MapTransitLayer} from './map-transit-layer';

describe('MapTransitLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Transit Layer', fakeAsync(() => {
    const transitLayerSpy = createTransitLayerSpy();
    const transitLayerConstructorSpy = createTransitLayerConstructorSpy(transitLayerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(transitLayerConstructorSpy).toHaveBeenCalled();
    expect(transitLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-transit-layer />
    </google-map>
  `,
  imports: [GoogleMap, MapTransitLayer],
})
class TestApp {}
