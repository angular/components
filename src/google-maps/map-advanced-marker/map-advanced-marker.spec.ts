import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createAdvancedMarkerConstructorSpy,
  createAdvancedMarkerSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';
import {DEFAULT_MARKER_OPTIONS, MapAdvancedMarker} from './map-advanced-marker';

describe('MapAdvancedMarker', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map advanced marker', fakeAsync(() => {
    const advancedMarkerSpy = createAdvancedMarkerSpy(DEFAULT_MARKER_OPTIONS);
    const advancedMarkerConstructorSpy = createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();
    expect(advancedMarkerConstructorSpy).toHaveBeenCalledWith({
      ...DEFAULT_MARKER_OPTIONS,
      title: undefined,
      content: undefined,
      gmpDraggable: undefined,
      zIndex: undefined,
      map: mapSpy,
    });
  }));

  it('sets advanced marker inputs', fakeAsync(() => {
    const options: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      map: mapSpy,
      content: undefined,
      gmpDraggable: true,
      zIndex: 1,
    };
    const advancedMarkerSpy = createAdvancedMarkerSpy(options);
    const advancedMarkerConstructorSpy = createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = options.position;
    fixture.componentInstance.title = options.title;
    fixture.componentInstance.content = options.content;
    fixture.componentInstance.gmpDraggable = options.gmpDraggable;
    fixture.componentInstance.zIndex = options.zIndex;

    fixture.detectChanges();
    flush();

    expect(advancedMarkerConstructorSpy).toHaveBeenCalledWith(options);
  }));

  it('sets marker options, ignoring map', fakeAsync(() => {
    const options: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      content: undefined,
      gmpDraggable: true,
      zIndex: 1,
    };
    const advancedMarkerSpy = createAdvancedMarkerSpy(options);
    const advancedMarkerConstructorSpy = createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();
    flush();

    expect(advancedMarkerConstructorSpy).toHaveBeenCalledWith({...options, map: mapSpy});
  }));

  it('gives precedence to specific inputs over options', fakeAsync(() => {
    const options: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      content: undefined,
      gmpDraggable: true,
      zIndex: 1,
    };

    const expectedOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {lat: 4, lng: 6},
      title: 'marker title 2',
      content: undefined,
      gmpDraggable: false,
      zIndex: 999,
      map: mapSpy,
    };
    const advancedMarkerSpy = createAdvancedMarkerSpy(options);
    const advancedMarkerConstructorSpy = createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = expectedOptions.position;
    fixture.componentInstance.title = expectedOptions.title;
    fixture.componentInstance.content = expectedOptions.content;
    fixture.componentInstance.gmpDraggable = expectedOptions.gmpDraggable;
    fixture.componentInstance.zIndex = expectedOptions.zIndex;
    fixture.componentInstance.options = options;

    fixture.detectChanges();
    flush();

    expect(advancedMarkerConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  }));

  it('initializes marker event handlers', fakeAsync(() => {
    const advancedMarkerSpy = createAdvancedMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const addSpy = advancedMarkerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('rightclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
  }));

  it('should be able to add an event listener after init', fakeAsync(() => {
    const advancedMarkerSpy = createAdvancedMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createAdvancedMarkerConstructorSpy(advancedMarkerSpy);

    const addSpy = advancedMarkerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.advancedMarker.mapDrag.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('drag', jasmine.any(Function));
    subscription.unsubscribe();
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-advanced-marker
        [title]="title"
        [position]="position"
        [content]="content"
        [gmpDraggable]="gmpDraggable"
        [zIndex]="zIndex"
        (mapClick)="handleClick()"
        (mapDblclick)="handleDblclick()"
        (mapMouseout)="handleMouseout()"
        (mapMouseover)="handleMouseover()"
        (mapMouseup)="handleMouseup()"
        (mapRightclick)="handleRightclick()"
        [options]="options" />
    </google-map>
  `,
  standalone: true,
  imports: [GoogleMap, MapAdvancedMarker],
})
class TestApp {
  @ViewChild(MapAdvancedMarker) advancedMarker: MapAdvancedMarker;
  title?: string | null;
  position?: google.maps.LatLng | google.maps.LatLngLiteral | null;
  content?: Node | google.maps.marker.PinElement | null;
  gmpDraggable?: boolean | null;
  zIndex?: number | null;
  options: google.maps.marker.AdvancedMarkerElementOptions;

  handleClick() {}
  handleDblclick() {}
  handleMouseout() {}
  handleMouseover() {}
  handleMouseup() {}
  handleRightclick() {}
}
