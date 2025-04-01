import {TestBed} from '@angular/core/testing';
import {MapDirectionsResponse, MapDirectionsService} from './map-directions-service';
import {
  createDirectionsServiceConstructorSpy,
  createDirectionsServiceSpy,
} from '../testing/fake-google-map-utils';

describe('MapDirectionsService', () => {
  let mapDirectionsService: MapDirectionsService;
  let directionsServiceConstructorSpy: jasmine.Spy;
  let directionsServiceSpy: jasmine.SpyObj<google.maps.DirectionsService>;

  beforeEach(() => {
    directionsServiceSpy = createDirectionsServiceSpy();
    directionsServiceConstructorSpy = createDirectionsServiceConstructorSpy(directionsServiceSpy);
    mapDirectionsService = TestBed.inject(MapDirectionsService);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('does not initialize the Google Maps Directions Service immediately', () => {
    expect(directionsServiceConstructorSpy).not.toHaveBeenCalled();
  });

  it('initializes the Google Maps Directions Service when `route` is called', () => {
    mapDirectionsService
      .route({
        origin: 'home',
        destination: 'work',
        travelMode: 'BICYCLING' as google.maps.TravelMode,
      })
      .subscribe();

    expect(directionsServiceConstructorSpy).toHaveBeenCalled();
  });

  it('calls route on inputs', () => {
    const result: google.maps.DirectionsResult = {
      routes: [],
      request: {
        origin: 'foo',
        destination: 'bar',
        travelMode: 'BICYCLING' as google.maps.TravelMode,
      },
    };
    const status = 'OK' as google.maps.DirectionsStatus;
    directionsServiceSpy.route.and.callFake((_request, callback) => {
      callback?.(result, status);
      return Promise.resolve(result);
    });

    mapDirectionsService
      .route({
        origin: 'home',
        destination: 'work',
        travelMode: 'BICYCLING' as google.maps.TravelMode,
      })
      .subscribe(response => {
        expect(response).toEqual({result, status} as MapDirectionsResponse);
      });
  });
});
