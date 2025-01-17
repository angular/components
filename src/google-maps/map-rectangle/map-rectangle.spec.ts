import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  createRectangleConstructorSpy,
  createRectangleSpy,
} from '../testing/fake-google-map-utils';

import {MapRectangle} from './map-rectangle';

describe('MapRectangle', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let rectangleBounds: google.maps.LatLngBoundsLiteral;
  let rectangleOptions: google.maps.RectangleOptions;

  beforeEach(() => {
    rectangleBounds = {east: 30, north: 15, west: 10, south: -5};
    rectangleOptions = {bounds: rectangleBounds, strokeColor: 'grey', strokeOpacity: 0.8};
  });

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Rectangle', fakeAsync(() => {
    const rectangleSpy = createRectangleSpy({});
    const rectangleConstructorSpy = createRectangleConstructorSpy(rectangleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(rectangleConstructorSpy).toHaveBeenCalledWith({bounds: undefined});
    expect(rectangleSpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('sets bounds from input', fakeAsync(() => {
    const bounds: google.maps.LatLngBoundsLiteral = {east: 3, north: 5, west: -3, south: -5};
    const options: google.maps.RectangleOptions = {bounds};
    const rectangleSpy = createRectangleSpy(options);
    const rectangleConstructorSpy = createRectangleConstructorSpy(rectangleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.bounds = bounds;
    fixture.detectChanges();
    flush();

    expect(rectangleConstructorSpy).toHaveBeenCalledWith(options);
  }));

  it('gives precedence to bounds input over options', fakeAsync(() => {
    const bounds: google.maps.LatLngBoundsLiteral = {east: 3, north: 5, west: -3, south: -5};
    const expectedOptions: google.maps.RectangleOptions = {...rectangleOptions, bounds};
    const rectangleSpy = createRectangleSpy(expectedOptions);
    const rectangleConstructorSpy = createRectangleConstructorSpy(rectangleSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = rectangleOptions;
    fixture.componentInstance.bounds = bounds;
    fixture.detectChanges();
    flush();

    expect(rectangleConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  }));

  it('exposes methods that provide information about the Rectangle', fakeAsync(() => {
    const rectangleSpy = createRectangleSpy(rectangleOptions);
    createRectangleConstructorSpy(rectangleSpy);

    const fixture = TestBed.createComponent(TestApp);
    const rectangleComponent = fixture.debugElement
      .query(By.directive(MapRectangle))!
      .injector.get<MapRectangle>(MapRectangle);
    fixture.detectChanges();
    flush();

    rectangleComponent.getBounds();
    expect(rectangleSpy.getBounds).toHaveBeenCalled();

    rectangleSpy.getDraggable.and.returnValue(true);
    expect(rectangleComponent.getDraggable()).toBe(true);

    rectangleSpy.getEditable.and.returnValue(true);
    expect(rectangleComponent.getEditable()).toBe(true);

    rectangleSpy.getVisible.and.returnValue(true);
    expect(rectangleComponent.getVisible()).toBe(true);
  }));

  it('initializes Rectangle event handlers', fakeAsync(() => {
    const rectangleSpy = createRectangleSpy(rectangleOptions);
    createRectangleConstructorSpy(rectangleSpy);

    const addSpy = rectangleSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).toHaveBeenCalledWith('bounds_changed', jasmine.any(Function));
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
    const rectangleSpy = createRectangleSpy(rectangleOptions);
    createRectangleConstructorSpy(rectangleSpy);

    const addSpy = rectangleSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.rectangle.rectangleDragend.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('dragend', jasmine.any(Function));
    subscription.unsubscribe();
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-rectangle
        [options]="options"
        [bounds]="bounds"
        (boundsChanged)="handleBoundsChange()"
        (rectangleClick)="handleClick()"
        (rectangleRightclick)="handleRightclick()" />
    </google-map>
  `,
  imports: [GoogleMap, MapRectangle],
})
class TestApp {
  @ViewChild(MapRectangle) rectangle: MapRectangle;
  options?: google.maps.RectangleOptions;
  bounds?: google.maps.LatLngBoundsLiteral;

  handleBoundsChange() {}

  handleClick() {}

  handleRightclick() {}
}
