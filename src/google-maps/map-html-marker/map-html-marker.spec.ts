import {Component, ViewChild} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS, UpdatedGoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  TestingWindow,
  createOverlayViewSpy,
  createOverlayViewConstructorSpy
} from '../testing/fake-google-map-utils';

import {GoogleMapsModule} from '../google-maps-module';
import {MapHTMLMarker} from './map-html-marker';

describe('MapHTMLMarker', () => {
  let mapSpy: jasmine.SpyObj<UpdatedGoogleMap>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();

    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();
  });

  afterEach(() => {
    const testingWindow: TestingWindow = window;
    delete testingWindow.google;
  });

  it('initializes a HTML marker', () => {
    const position = { lat: 3, lng: 5 };
    const overlaySpy = createOverlayViewSpy();
    const overlayConstructorSpy = createOverlayViewConstructorSpy(overlaySpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = position;
    fixture.detectChanges();

    expect(overlayConstructorSpy).toHaveBeenCalled();
    expect(overlaySpy.setMap).toHaveBeenCalledWith(mapSpy);
    expect(overlaySpy.setPosition).toHaveBeenCalledWith(position);
  });

  it('exposes methods that provide information about the marker', () => {
    const overlaySpy = createOverlayViewSpy();
    createOverlayViewConstructorSpy(overlaySpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const markerComponent = fixture.debugElement.query(
      By.directive(MapHTMLMarker)).componentInstance;
    fixture.detectChanges();

    overlaySpy.getMap.and.returnValue(mapSpy);
    expect(markerComponent.getMap()).toBe(mapSpy);
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
               <div html-marker
                   [position]="position">
               </div>
             </google-map>`,
})
class TestApp {
  @ViewChild(MapHTMLMarker) marker: MapHTMLMarker;
  position?: google.maps.LatLng|google.maps.LatLngLiteral;
}
