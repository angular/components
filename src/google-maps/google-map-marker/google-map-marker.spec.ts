import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {DEFAULT_OPTIONS, GoogleMapMarkerModule} from './index';

import {createMarkerSpy, createMarkerConstructorSpy, TestingWindow} from '../testing/fake-google-map-utils';

describe('GoogleMapMarker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapMarkerModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();
  });

  afterEach(() => {
    const testingWindow: TestingWindow = window;
    delete testingWindow.google;
  });

  it('initializes a Google Map marker', () => {
    let markerSpy = createMarkerSpy(DEFAULT_OPTIONS);
    let markerConstructorSpy = createMarkerConstructorSpy(markerSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith(DEFAULT_OPTIONS);
  });

  it('sets marker inputs', () => {});

  it('sets marker options, ignoring map', () => {});

  it('gives precedence to specific inputs over options', () => {});

  it('sets the map on the marker only once', () => {});

  it('exposes methods that provide information about the marker', () => {});

  it('initializes marker event handlers', () => {});
});

@Component({
  selector: 'test-app',
  template: `<google-map-marker [title]="title"
                                [position]="position"
                                [label]="label"
                                [clickable]="clickable"
                                [options]="options"
                                (mapClick)="handleClick()"
                                (positionChanged)="handlePositionChanged()"></google-map-marker>`,
})
class TestApp {
  title?: string;
  position?: google.maps.LatLngLiteral;
  label?: string;
  clickable?: boolean;
  options?: google.maps.MarkerOptions;

  handleClick() {}

  handlePositionChanged() {}
}
