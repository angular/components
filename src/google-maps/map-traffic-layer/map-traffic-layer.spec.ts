import {Component} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  createTrafficLayerConstructorSpy,
  createTrafficLayerSpy,
} from '../testing/fake-google-map-utils';

import {MapTrafficLayer} from './map-traffic-layer';

describe('MapTrafficLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  const trafficLayerOptions: google.maps.TrafficLayerOptions = {autoRefresh: false};

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Traffic Layer', fakeAsync(() => {
    const trafficLayerSpy = createTrafficLayerSpy(trafficLayerOptions);
    const trafficLayerConstructorSpy = createTrafficLayerConstructorSpy(trafficLayerSpy);
    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.autoRefresh = false;
    fixture.detectChanges();
    flush();

    expect(trafficLayerConstructorSpy).toHaveBeenCalledWith(trafficLayerOptions);
    expect(trafficLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-traffic-layer [autoRefresh]="autoRefresh" />
    </google-map>
  `,
  imports: [GoogleMap, MapTrafficLayer],
})
class TestApp {
  autoRefresh?: boolean;
}
