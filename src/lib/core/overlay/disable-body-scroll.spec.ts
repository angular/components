import {TestBed, async, inject} from '@angular/core/testing';
import {OverlayModule} from './overlay-directives';
import {DisableBodyScroll} from './disable-body-scroll';


describe('DisableBodyScroll', () => {
  let service: DisableBodyScroll;
  let startingWindowHeight = window.innerHeight;
  let forceScrollElement: HTMLElement = document.createElement('div');

  forceScrollElement.style.height = '3000px';
  forceScrollElement.style.width = '100px';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule.forRoot()]
    });
  }));

  beforeEach(inject([DisableBodyScroll], (disableBodyScroll: DisableBodyScroll) => {
    service = disableBodyScroll;
  }));

  afterEach(() => {
    if (forceScrollElement.parentNode) {
      forceScrollElement.parentNode.removeChild(forceScrollElement);
    }

    service.deactivate();
  });

  it('should prevent scrolling', () => {
    document.body.appendChild(forceScrollElement);
    window.scrollTo(0, 100);

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerHeight > startingWindowHeight) {
      return;
    }

    window.scrollTo(0, 100);

    service.activate();

    window.scrollTo(0, 500);

    expect(window.pageYOffset).toBe(0);
  });

  it('should toggle the isActive property', () => {
    document.body.appendChild(forceScrollElement);
    window.scrollTo(0, 100);

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerHeight > startingWindowHeight) {
      return;
    }

    service.activate();
    expect(service.isActive).toBe(true);

    service.deactivate();
    expect(service.isActive).toBe(false);
  });

  it('should not disable scrolling if the content is shorter than the viewport height', () => {
    service.activate();
    expect(service.isActive).toBe(false);
  });

  it('should add the proper inline styles to the <body> and <html> nodes', () => {
    document.body.appendChild(forceScrollElement);
    window.scrollTo(0, 500);

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerHeight > startingWindowHeight) {
      return;
    }

    let bodyCSS = document.body.style;
    let htmlCSS = document.documentElement.style;

    service.activate();

    expect(bodyCSS.position).toBe('fixed');
    expect(bodyCSS.width).toBe('100%');
    expect(bodyCSS.top).toBe('-500px');
    expect(bodyCSS.maxWidth).toBeTruthy();
    expect(htmlCSS.overflowY).toBe('scroll');
  });

  it('should revert any previously-set inline styles', () => {
    let bodyCSS = document.body.style;
    let htmlCSS = document.documentElement.style;

    document.body.appendChild(forceScrollElement);

    bodyCSS.position = 'static';
    bodyCSS.width = '1000px';
    htmlCSS.overflowY = 'hidden';

    service.activate();
    service.deactivate();

    expect(bodyCSS.position).toBe('static');
    expect(bodyCSS.width).toBe('1000px');
    expect(htmlCSS.overflowY).toBe('hidden');

    bodyCSS.cssText = '';
    htmlCSS.cssText = '';
  });

  it('should restore the scroll position when enabling scrolling', () => {
    document.body.appendChild(forceScrollElement);
    window.scrollTo(0, 1000);

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerHeight > startingWindowHeight) {
      return;
    }

    service.activate();
    service.deactivate();

    expect(window.pageYOffset).toBe(1000);
  });
});
