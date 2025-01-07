import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MapDirectionsRenderer} from './map-directions-renderer';
import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createDirectionsRendererConstructorSpy,
  createDirectionsRendererSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

const DEFAULT_DIRECTIONS: google.maps.DirectionsResult = {
  geocoded_waypoints: [],
  routes: [],
  request: {origin: 'foo', destination: 'bar', travelMode: 'BICYCLING' as google.maps.TravelMode},
};

describe('MapDirectionsRenderer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Maps DirectionsRenderer', fakeAsync(() => {
    const directionsRendererSpy = createDirectionsRendererSpy({directions: DEFAULT_DIRECTIONS});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = {directions: DEFAULT_DIRECTIONS};
    fixture.detectChanges();
    flush();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: DEFAULT_DIRECTIONS,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('sets directions from directions input', fakeAsync(() => {
    const directionsRendererSpy = createDirectionsRendererSpy({directions: DEFAULT_DIRECTIONS});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.directions = DEFAULT_DIRECTIONS;
    fixture.detectChanges();
    flush();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: DEFAULT_DIRECTIONS,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('gives precedence to directions over options', fakeAsync(() => {
    const updatedDirections: google.maps.DirectionsResult = {
      geocoded_waypoints: [{partial_match: false, place_id: 'test', types: []}],
      request: {
        origin: 'foo',
        destination: 'bar',
        travelMode: 'BICYCLING' as google.maps.TravelMode,
      },
      routes: [],
    };
    const directionsRendererSpy = createDirectionsRendererSpy({directions: updatedDirections});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = {directions: DEFAULT_DIRECTIONS};
    fixture.componentInstance.directions = updatedDirections;
    fixture.detectChanges();
    flush();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: updatedDirections,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('exposes methods that provide information from the DirectionsRenderer', fakeAsync(() => {
    const directionsRendererSpy = createDirectionsRendererSpy({});
    createDirectionsRendererConstructorSpy(directionsRendererSpy);

    const fixture = TestBed.createComponent(TestApp);

    const directionsRendererComponent = fixture.debugElement
      .query(By.directive(MapDirectionsRenderer))!
      .injector.get<MapDirectionsRenderer>(MapDirectionsRenderer);
    fixture.detectChanges();
    flush();

    directionsRendererSpy.getDirections.and.returnValue(DEFAULT_DIRECTIONS);
    expect(directionsRendererComponent.getDirections()).toBe(DEFAULT_DIRECTIONS);

    directionsRendererComponent.getPanel();
    expect(directionsRendererSpy.getPanel).toHaveBeenCalled();

    directionsRendererSpy.getRouteIndex.and.returnValue(10);
    expect(directionsRendererComponent.getRouteIndex()).toBe(10);
  }));

  it('initializes DirectionsRenderer event handlers', fakeAsync(() => {
    const directionsRendererSpy = createDirectionsRendererSpy({});
    createDirectionsRendererConstructorSpy(directionsRendererSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(directionsRendererSpy.addListener).toHaveBeenCalledWith(
      'directions_changed',
      jasmine.any(Function),
    );
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-directions-renderer
        [options]="options"
        [directions]="directions"
        (directionsChanged)="handleDirectionsChanged()" />
    </google-map>
  `,
  imports: [GoogleMap, MapDirectionsRenderer],
})
class TestApp {
  @ViewChild(MapDirectionsRenderer) directionsRenderer: MapDirectionsRenderer;
  options?: google.maps.DirectionsRendererOptions;
  directions?: google.maps.DirectionsResult;

  handleDirectionsChanged() {}
}
