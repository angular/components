import {DEFAULT_OPTIONS, UpdatedGoogleMap} from '../google-map/google-map';
import {
  createMapConstructorSpy,
  createMapSpy,
  TestingWindow,
  createOverlayViewSpy,
  createOverlayViewConstructorSpy,
  OverlayViewSpy
} from '../testing/fake-google-map-utils';
import {HTMLMarkerOptions, HTMLMarker} from './html-marker';

describe('HtmlMarker', () => {
  let mapSpy: jasmine.SpyObj<UpdatedGoogleMap>;
  let overlaySpy: OverlayViewSpy;
  let overlayPaneSpy: jasmine.SpyObj<Element>;
  let overlayConstructorSpy: jasmine.Spy;
  let content: HTMLElement;

  beforeEach(() => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();
    overlayPaneSpy = jasmine.createSpyObj('pane.element', ['appendChild']);
    overlaySpy = createOverlayViewSpy(overlayPaneSpy);
    overlayConstructorSpy = createOverlayViewConstructorSpy(overlaySpy).and.callThrough();
    content = document.createElement('div');
  });

  afterEach(() => {
    const testingWindow: TestingWindow = window;
    delete testingWindow.google;
  });

  it('initializes a HTML marker', () => {
    const options: HTMLMarkerOptions = {
      content,
      position: { lat: 3, lng: 5 },
    };

    // Testing of side effects
    // tslint:disable-next-line: no-unused-expression
    new HTMLMarker(options);
    expect(overlayConstructorSpy).toHaveBeenCalled();
    expect(overlaySpy.setPosition).toHaveBeenCalledWith(options.position);
  });

  it('appends content to map', () => {
    const options: HTMLMarkerOptions = {
      content,
      position: { lat: 3, lng: 5 },
    };

    const marker = new HTMLMarker(options);
    marker.draw();

    expect(overlayPaneSpy.appendChild).toHaveBeenCalledWith(jasmine.objectContaining({
      firstElementChild: options.content,
    }));

    const markerElement = marker['_element'];
    expect(markerElement.style.position).toBe('absolute');
    expect(markerElement.style.left).toBe(`${options.position.lat}px`);
    expect(markerElement.style.top).toBe(`${options.position.lng}px`);
  });
});
