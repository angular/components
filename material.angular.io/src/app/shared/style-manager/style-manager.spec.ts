import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {StyleManager} from './style-manager';

describe('StyleManager', () => {
  let styleManager: StyleManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StyleManager],
    });

    styleManager = TestBed.inject(StyleManager);
  });

  afterEach(() => {
    const links = document.head.querySelectorAll('link');

    Array.from(links).forEach(link => {
      if (link.className.includes('style-manager-')) {
        link.remove();
      }
    });
  });

  it('should add stylesheet to head', () => {
    styleManager.setStyle('test', 'test.css');
    const styleEl = document.head.querySelector('.style-manager-test') as HTMLLinkElement;
    expect(styleEl).not.toBeNull();
    expect(styleEl.href.endsWith('test.css')).toBe(true);
  });

  it('should change existing stylesheet', () => {
    styleManager.setStyle('test', 'test.css');
    const styleEl = document.head.querySelector('.style-manager-test') as HTMLLinkElement;
    expect(styleEl).not.toBeNull();
    expect(styleEl.href.endsWith('test.css')).toBe(true);

    styleManager.setStyle('test', 'new.css');
    expect(styleEl.href.endsWith('new.css')).toBe(true);
  });

  it('should remove existing stylesheet', () => {
    styleManager.setStyle('test', 'test.css');
    let styleEl = document.head.querySelector('.style-manager-test') as HTMLLinkElement;
    expect(styleEl).not.toBeNull();
    expect(styleEl.href.endsWith('test.css')).toBe(true);

    styleManager.removeStyle('test');
    styleEl = document.head.querySelector('.style-manager-test') as HTMLLinkElement;
    expect(styleEl).toBeNull();
  });
});
