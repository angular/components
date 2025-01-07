import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createCircleConstructorSpy,
  createCircleSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

import {MapCircle} from './map-circle';

describe('MapCircle', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let circleCenter: google.maps.LatLngLiteral;
  let circleRadius: number;
  let circleOptions: google.maps.CircleOptions;

  beforeEach(() => {
    circleCenter = {lat: 30, lng: 15};
    circleRadius = 15;
    circleOptions = {
      center: circleCenter,
      radius: circleRadius,
      strokeColor: 'grey',
      strokeOpacity: 0.8,
    };
  });

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Circle', fakeAsync(() => {
    const circleSpy = createCircleSpy({});
    const circleConstructorSpy = createCircleConstructorSpy(circleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(circleConstructorSpy).toHaveBeenCalledWith({center: undefined, radius: undefined});
    expect(circleSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('sets center and radius from input', fakeAsync(() => {
    const center: google.maps.LatLngLiteral = {lat: 3, lng: 5};
    const radius = 15;
    const options: google.maps.CircleOptions = {center, radius};
    const circleSpy = createCircleSpy(options);
    const circleConstructorSpy = createCircleConstructorSpy(circleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.center = center;
    fixture.componentInstance.radius = radius;
    fixture.detectChanges();
    flush();

    expect(circleConstructorSpy).toHaveBeenCalledWith(options);
  }));

  it('gives precedence to other inputs over options', fakeAsync(() => {
    const center: google.maps.LatLngLiteral = {lat: 3, lng: 5};
    const radius = 15;
    const expectedOptions: google.maps.CircleOptions = {...circleOptions, center, radius};
    const circleSpy = createCircleSpy(expectedOptions);
    const circleConstructorSpy = createCircleConstructorSpy(circleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = circleOptions;
    fixture.componentInstance.center = center;
    fixture.componentInstance.radius = radius;
    fixture.detectChanges();
    flush();

    expect(circleConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  }));

  it('exposes methods that provide information about the Circle', fakeAsync(() => {
    const circleSpy = createCircleSpy(circleOptions);
    createCircleConstructorSpy(circleSpy);

    const fixture = TestBed.createComponent(TestApp);
    const circleComponent = fixture.debugElement
      .query(By.directive(MapCircle))!
      .injector.get<MapCircle>(MapCircle);
    fixture.detectChanges();
    flush();

    circleComponent.getCenter();
    expect(circleSpy.getCenter).toHaveBeenCalled();

    circleSpy.getRadius.and.returnValue(10);
    expect(circleComponent.getRadius()).toBe(10);

    circleSpy.getDraggable.and.returnValue(true);
    expect(circleComponent.getDraggable()).toBe(true);

    circleSpy.getEditable.and.returnValue(true);
    expect(circleComponent.getEditable()).toBe(true);

    circleSpy.getVisible.and.returnValue(true);
    expect(circleComponent.getVisible()).toBe(true);
  }));

  it('initializes Circle event handlers', fakeAsync(() => {
    const circleSpy = createCircleSpy(circleOptions);
    createCircleConstructorSpy(circleSpy);

    const addSpy = circleSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).toHaveBeenCalledWith('center_changed', jasmine.any(Function));
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
    expect(addSpy).not.toHaveBeenCalledWith('radius_changed', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('rightclick', jasmine.any(Function));
  }));

  it('should be able to add an event listener after init', fakeAsync(() => {
    const circleSpy = createCircleSpy(circleOptions);
    createCircleConstructorSpy(circleSpy);

    const addSpy = circleSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.circle.circleDragend.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('dragend', jasmine.any(Function));
    subscription.unsubscribe();
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-circle
        [options]="options"
        [center]="center"
        [radius]="radius"
        (centerChanged)="handleCenterChange()"
        (circleClick)="handleClick()"
        (circleRightclick)="handleRightclick()" />
    </google-map>`,
  imports: [GoogleMap, MapCircle],
})
class TestApp {
  @ViewChild(MapCircle) circle: MapCircle;
  options?: google.maps.CircleOptions;
  center?: google.maps.LatLngLiteral;
  radius?: number;

  handleCenterChange() {}

  handleClick() {}

  handleRightclick() {}
}
