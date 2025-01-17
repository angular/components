import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  createPolygonConstructorSpy,
  createPolygonSpy,
} from '../testing/fake-google-map-utils';

import {MapPolygon} from './map-polygon';

describe('MapPolygon', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let polygonPath: google.maps.LatLngLiteral[];
  let polygonOptions: google.maps.PolygonOptions;

  beforeEach(() => {
    polygonPath = [
      {lat: 25, lng: 26},
      {lat: 26, lng: 27},
      {lat: 30, lng: 34},
    ];
    polygonOptions = {paths: polygonPath, strokeColor: 'grey', strokeOpacity: 0.8};
  });

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Polygon', fakeAsync(() => {
    const polygonSpy = createPolygonSpy({});
    const polygonConstructorSpy = createPolygonConstructorSpy(polygonSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(polygonConstructorSpy).toHaveBeenCalledWith({paths: undefined});
    expect(polygonSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('sets path from input', fakeAsync(() => {
    const paths: google.maps.LatLngLiteral[] = [{lat: 3, lng: 5}];
    const options: google.maps.PolygonOptions = {paths};
    const polygonSpy = createPolygonSpy(options);
    const polygonConstructorSpy = createPolygonConstructorSpy(polygonSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.paths = paths;
    fixture.detectChanges();
    flush();

    expect(polygonConstructorSpy).toHaveBeenCalledWith(options);
  }));

  it('gives precedence to path input over options', fakeAsync(() => {
    const paths: google.maps.LatLngLiteral[] = [{lat: 3, lng: 5}];
    const expectedOptions: google.maps.PolygonOptions = {...polygonOptions, paths};
    const polygonSpy = createPolygonSpy(expectedOptions);
    const polygonConstructorSpy = createPolygonConstructorSpy(polygonSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = polygonOptions;
    fixture.componentInstance.paths = paths;
    fixture.detectChanges();
    flush();

    expect(polygonConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  }));

  it('exposes methods that provide information about the Polygon', fakeAsync(() => {
    const polygonSpy = createPolygonSpy(polygonOptions);
    createPolygonConstructorSpy(polygonSpy);

    const fixture = TestBed.createComponent(TestApp);
    const polygonComponent = fixture.debugElement
      .query(By.directive(MapPolygon))!
      .injector.get<MapPolygon>(MapPolygon);
    fixture.detectChanges();
    flush();

    polygonSpy.getDraggable.and.returnValue(true);
    expect(polygonComponent.getDraggable()).toBe(true);

    polygonSpy.getEditable.and.returnValue(true);
    expect(polygonComponent.getEditable()).toBe(true);

    polygonComponent.getPath();
    expect(polygonSpy.getPath).toHaveBeenCalled();

    polygonComponent.getPaths();
    expect(polygonSpy.getPaths).toHaveBeenCalled();

    polygonSpy.getVisible.and.returnValue(true);
    expect(polygonComponent.getVisible()).toBe(true);
  }));

  it('initializes Polygon event handlers', fakeAsync(() => {
    const polygonSpy = createPolygonSpy(polygonOptions);
    createPolygonConstructorSpy(polygonSpy);

    const addSpy = polygonSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousedown', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousemove', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('rightclick', jasmine.any(Function));
  }));

  it('should be able to add an event listener after init', fakeAsync(() => {
    const polygonSpy = createPolygonSpy(polygonOptions);
    createPolygonConstructorSpy(polygonSpy);

    const addSpy = polygonSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.polygon.polygonDragend.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('dragend', jasmine.any(Function));
    subscription.unsubscribe();
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-polygon
        [options]="options"
        [paths]="paths"
        (polygonClick)="handleClick()"
        (polygonRightclick)="handleRightclick()">
      </map-polygon>
    </google-map>
  `,
  imports: [GoogleMap, MapPolygon],
})
class TestApp {
  @ViewChild(MapPolygon) polygon: MapPolygon;
  options?: google.maps.PolygonOptions;
  paths?: google.maps.LatLngLiteral[];

  handleClick() {}

  handleRightclick() {}
}
