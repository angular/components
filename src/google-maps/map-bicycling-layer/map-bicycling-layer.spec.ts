import {Component} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createBicyclingLayerConstructorSpy,
  createBicyclingLayerSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

import {MapBicyclingLayer} from './map-bicycling-layer';

describe('MapBicyclingLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Bicycling Layer', fakeAsync(() => {
    const bicyclingLayerSpy = createBicyclingLayerSpy();
    const bicyclingLayerConstructorSpy = createBicyclingLayerConstructorSpy(bicyclingLayerSpy);
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(bicyclingLayerConstructorSpy).toHaveBeenCalled();
    expect(bicyclingLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-bicycling-layer />
    </google-map>
  `,
  imports: [GoogleMap, MapBicyclingLayer],
})
class TestApp {}
