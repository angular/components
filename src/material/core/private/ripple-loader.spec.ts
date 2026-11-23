import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {TestBed} from '@angular/core/testing';
import {MATERIAL_ANIMATIONS} from '../animation/animation';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from '../ripple';
import {MatRippleLoader} from './ripple-loader';

describe('MatRippleLoader', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  /** Has the ripple loader create the host's ripple, then disables and re-enables the host. */
  function createReenabledRipple() {
    const rippleLoader = TestBed.inject(MatRippleLoader);
    rippleLoader.configureRipple(host, {className: 'test-ripple'});

    // Hovering makes the ripple loader create the ripple before the host is disabled.
    dispatchMouseEvent(host, 'mouseenter');

    rippleLoader.setDisabled(host, true);
    rippleLoader.setDisabled(host, false);
  }

  it('should show a ripple when pressing a re-enabled host', () => {
    createReenabledRipple();

    dispatchMouseEvent(host, 'mousedown');

    expect(host.querySelectorAll('.mat-ripple-element').length).toBe(1);
  });

  it('should not show a ripple on a re-enabled host if ripples are disabled globally', () => {
    TestBed.configureTestingModule({
      providers: [{provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: {disabled: true}}],
    });
    createReenabledRipple();

    dispatchMouseEvent(host, 'mousedown');

    expect(host.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected no ripple to show up if ripples are disabled globally.')
      .toBe(0);
  });

  it('should not show a ripple on a re-enabled host if animations are disabled', () => {
    TestBed.configureTestingModule({
      providers: [{provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}}],
    });
    createReenabledRipple();

    dispatchMouseEvent(host, 'mousedown');

    expect(host.querySelectorAll('.mat-ripple-element').length)
      .withContext('Expected no ripple to show up if animations are disabled.')
      .toBe(0);
  });
});
