import {Component, ViewChild} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS, GoogleMap} from '../google-map/google-map';
import {
  createGroundOverlayConstructorSpy,
  createGroundOverlaySpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

import {MapGroundOverlay} from './map-ground-overlay';

describe('MapGroundOverlay', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  const url = 'www.testimg.com/img.jpg';
  const bounds: google.maps.LatLngBoundsLiteral = {east: 3, north: 5, west: -3, south: -5};
  const clickable = true;
  const opacity = 0.5;
  const groundOverlayOptions: google.maps.GroundOverlayOptions = {clickable, opacity};

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Ground Overlay', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    const groundOverlayConstructorSpy = createGroundOverlayConstructorSpy(groundOverlaySpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.url = url;
    fixture.componentInstance.bounds = bounds;
    fixture.componentInstance.clickable = clickable;
    fixture.componentInstance.opacity = opacity;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(groundOverlayConstructorSpy).toHaveBeenCalledWith(url, bounds, groundOverlayOptions);
    expect(groundOverlaySpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('exposes methods that provide information about the Ground Overlay', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    createGroundOverlayConstructorSpy(groundOverlaySpy);

    const fixture = TestBed.createComponent(TestApp);
    const groundOverlayComponent = fixture.debugElement
      .query(By.directive(MapGroundOverlay))!
      .injector.get<MapGroundOverlay>(MapGroundOverlay);
    fixture.componentInstance.url = url;
    fixture.componentInstance.bounds = bounds;
    fixture.componentInstance.opacity = opacity;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    groundOverlayComponent.getBounds();
    expect(groundOverlaySpy.getBounds).toHaveBeenCalled();

    groundOverlaySpy.getOpacity.and.returnValue(opacity);
    expect(groundOverlayComponent.getOpacity()).toBe(opacity);

    groundOverlaySpy.getUrl.and.returnValue(url);
    expect(groundOverlayComponent.getUrl()).toBe(url);
  }));

  it('initializes Ground Overlay event handlers', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    createGroundOverlayConstructorSpy(groundOverlaySpy);

    const addSpy = groundOverlaySpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.url = url;
    fixture.componentInstance.bounds = bounds;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
  }));

  it('should be able to add an event listener after init', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    createGroundOverlayConstructorSpy(groundOverlaySpy);

    const addSpy = groundOverlaySpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.url = url;
    fixture.componentInstance.bounds = bounds;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.groundOverlay.mapDblclick.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    subscription.unsubscribe();
  }));

  it('should be able to change the image after init', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    const groundOverlayConstructorSpy = createGroundOverlayConstructorSpy(groundOverlaySpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.url = url;
    fixture.componentInstance.bounds = bounds;
    fixture.componentInstance.clickable = clickable;
    fixture.componentInstance.opacity = opacity;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    expect(groundOverlayConstructorSpy).toHaveBeenCalledWith(url, bounds, groundOverlayOptions);
    expect(groundOverlaySpy.setMap).toHaveBeenCalledWith(mapSpy);

    groundOverlaySpy.setMap.calls.reset();
    fixture.componentInstance.url = 'foo.png';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(groundOverlaySpy.set).toHaveBeenCalledWith('url', 'foo.png');
    expect(groundOverlaySpy.setMap).toHaveBeenCalledTimes(2);
    expect(groundOverlaySpy.setMap).toHaveBeenCalledWith(null);
    expect(groundOverlaySpy.setMap).toHaveBeenCalledWith(mapSpy);
  }));

  it('should recreate the ground overlay when the bounds change', fakeAsync(() => {
    const groundOverlaySpy = createGroundOverlaySpy(url, bounds, groundOverlayOptions);
    createGroundOverlayConstructorSpy(groundOverlaySpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    flush();

    const oldOverlay = fixture.componentInstance.groundOverlay.groundOverlay;
    fixture.componentInstance.bounds = {...bounds};
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();

    const newOverlay = fixture.componentInstance.groundOverlay.groundOverlay;
    expect(newOverlay).toBeTruthy();
    expect(newOverlay).not.toBe(oldOverlay);
  }));
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-ground-overlay
        [url]="url"
        [bounds]="bounds"
        [clickable]="clickable"
        [opacity]="opacity"
        (mapClick)="handleClick()" />
    </google-map>
  `,
  imports: [GoogleMap, MapGroundOverlay],
})
class TestApp {
  @ViewChild(MapGroundOverlay) groundOverlay: MapGroundOverlay;
  url!: string;
  bounds!: google.maps.LatLngBoundsLiteral;
  clickable = false;
  opacity = 1;

  handleClick() {}
}
