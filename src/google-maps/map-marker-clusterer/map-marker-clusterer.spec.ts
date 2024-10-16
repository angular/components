import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush} from '@angular/core/testing';
import type {MarkerClusterer, Renderer, Algorithm} from './map-marker-clusterer-types';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createMarkerClustererConstructorSpy,
  createMarkerClustererSpy,
  createAdvancedMarkerSpy,
  createAdvancedMarkerConstructorSpy,
} from '../testing/fake-google-map-utils';
import {MapMarkerClusterer} from './map-marker-clusterer';

describe('MapMarkerClusterer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let markerClustererSpy: jasmine.SpyObj<MarkerClusterer>;
  let markerClustererConstructorSpy: jasmine.Spy;
  let fixture: ComponentFixture<TestApp>;
  const anyMarkerMatcher = jasmine.any(
    Object,
  ) as unknown as google.maps.marker.AdvancedMarkerElement;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();

    const markerSpy = createAdvancedMarkerSpy({});
    // The spy target function cannot be an arrow-function as this breaks when created
    // through `new`.
    createAdvancedMarkerConstructorSpy(markerSpy).and.callFake(function () {
      return createAdvancedMarkerSpy({});
    });

    markerClustererSpy = createMarkerClustererSpy();
    markerClustererConstructorSpy =
      createMarkerClustererConstructorSpy(markerClustererSpy).and.callThrough();

    fixture = TestBed.createComponent(TestApp);
  });

  afterEach(() => {
    (window.google as any) = undefined;
    (window as any).markerClusterer = undefined;
  });

  it('throws an error if the clustering library has not been loaded', fakeAsync(() => {
    (window as any).markerClusterer = undefined;
    markerClustererConstructorSpy = createMarkerClustererConstructorSpy(
      markerClustererSpy,
      false,
    ).and.callThrough();

    expect(() => {
      fixture.detectChanges();
      flush();
    }).toThrowError(/MarkerClusterer class not found, cannot construct a marker cluster/);
  }));

  it('initializes a Google Map Marker Clusterer', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith({
      map: mapSpy,
      renderer: undefined,
      algorithm: undefined,
      onClusterClick: jasmine.any(Function),
    });
  }));

  it('sets marker clusterer inputs', fakeAsync(() => {
    fixture.componentInstance.algorithm = {name: 'custom'} as any;
    fixture.componentInstance.renderer = {render: () => null!};
    fixture.detectChanges();
    flush();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith({
      map: mapSpy,
      algorithm: fixture.componentInstance.algorithm,
      renderer: fixture.componentInstance.renderer,
      onClusterClick: jasmine.any(Function),
    });
  }));

  it('recreates the clusterer if the options change', fakeAsync(() => {
    fixture.componentInstance.algorithm = {name: 'custom1'} as any;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith({
      map: mapSpy,
      algorithm: jasmine.objectContaining({name: 'custom1'}),
      renderer: undefined,
      onClusterClick: jasmine.any(Function),
    });

    fixture.componentInstance.algorithm = {name: 'custom2'} as any;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith({
      map: mapSpy,
      algorithm: jasmine.objectContaining({name: 'custom2'}),
      renderer: undefined,
      onClusterClick: jasmine.any(Function),
    });
  }));

  it('sets Google Maps Markers in the MarkerClusterer', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([
      anyMarkerMatcher,
      anyMarkerMatcher,
    ]);
  }));

  it('updates Google Maps Markers in the Marker Clusterer', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([
      anyMarkerMatcher,
      anyMarkerMatcher,
    ]);

    fixture.componentInstance.state = 'state2';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([anyMarkerMatcher], true);
    expect(markerClustererSpy.removeMarkers).toHaveBeenCalledWith([anyMarkerMatcher], true);
    expect(markerClustererSpy.render).toHaveBeenCalledTimes(1);

    fixture.componentInstance.state = 'state0';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([], true);
    expect(markerClustererSpy.removeMarkers).toHaveBeenCalledWith(
      [anyMarkerMatcher, anyMarkerMatcher],
      true,
    );
    expect(markerClustererSpy.render).toHaveBeenCalledTimes(2);
  }));

  it('initializes event handlers on the map related to clustering', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(mapSpy.addListener).toHaveBeenCalledWith('clusteringbegin', jasmine.any(Function));
    expect(mapSpy.addListener).not.toHaveBeenCalledWith('clusteringend', jasmine.any(Function));
  }));

  it('emits to clusterClick when the `onClusterClick` callback is invoked', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    expect(fixture.componentInstance.onClusterClick).not.toHaveBeenCalled();

    const callback = markerClustererConstructorSpy.calls.mostRecent().args[0].onClusterClick;
    callback({}, {}, {});
    fixture.detectChanges();
    flush();

    expect(fixture.componentInstance.onClusterClick).toHaveBeenCalledTimes(1);
  }));
});

@Component({
  selector: 'test-app',
  standalone: true,
  imports: [GoogleMapsModule],
  template: `
    <google-map>
      <map-marker-clusterer
        (clusteringbegin)="onClusteringBegin()"
        (clusterClick)="onClusterClick()"
        [renderer]="renderer"
        [algorithm]="algorithm">
        @if (state === 'state1') {
          <map-advanced-marker/>
        }
        @if (state === 'state1' || state === 'state2') {
          <map-advanced-marker/>
        }
        @if (state === 'state2') {
          <map-advanced-marker/>
        }
      </map-marker-clusterer>
    </google-map>
  `,
})
class TestApp {
  @ViewChild(MapMarkerClusterer) markerClusterer: MapMarkerClusterer;
  renderer: Renderer;
  algorithm: Algorithm;
  state = 'state1';
  onClusteringBegin = jasmine.createSpy('onclusteringbegin spy');
  onClusterClick = jasmine.createSpy('clusterClick spy');
}
