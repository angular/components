import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

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
    createMapConstructorSpy(mapSpy).and.callThrough();
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Transit Layer', () => {
    const transitLayerSpy = createTransitLayerSpy();
    const transitLayerConstructorSpy =
      createTransitLayerConstructorSpy(transitLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(transitLayerConstructorSpy).toHaveBeenCalled();
    expect(transitLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-transit-layer />
    </google-map>
  `,
  standalone: true,
  imports: [GoogleMap, MapTransitLayer],
})
class TestApp {}
