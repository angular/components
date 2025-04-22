import {Component, ApplicationRef, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {PortalModule, ComponentPortal} from '../../portal';
import {
  OverlayModule,
  OverlayConfig,
  OverlayRef,
  createOverlayRef,
  createGlobalPositionStrategy,
} from '../index';

describe('GlobalPositonStrategy', () => {
  let overlayRef: OverlayRef;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, BlankPortal],
    });

    injector = TestBed.inject(Injector);
  });

  afterEach(() => {
    if (overlayRef) {
      overlayRef.dispose();
      overlayRef = null!;
    }
  });

  function attachOverlay(config: OverlayConfig): OverlayRef {
    const portal = new ComponentPortal(BlankPortal);
    overlayRef = createOverlayRef(injector, config);
    overlayRef.attach(portal);
    TestBed.inject(ApplicationRef).tick();
    return overlayRef;
  }

  it('should position the element to the (top, left) with an offset', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).top('10px').left('40px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40px');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');
  });

  it('should position the element to the (bottom, right) with an offset', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).bottom('70px').right('15em'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('');
    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginBottom).toBe('70px');
    expect(elementStyle.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  });

  it('should overwrite previously applied positioning', () => {
    const positionStrategy = createGlobalPositionStrategy(injector)
      .centerHorizontally()
      .centerVertically();

    attachOverlay({positionStrategy});
    positionStrategy.top('10px').left('40%');
    overlayRef.updatePosition();

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40%');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');

    positionStrategy.bottom('70px').right('15em');
    overlayRef.updatePosition();

    expect(elementStyle.marginTop).toBe('');
    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginBottom).toBe('70px');
    expect(elementStyle.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  });

  it('should not set any alignment by default', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector),
    });

    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(parentStyle.justifyContent).toBe('');
    expect(parentStyle.alignItems).toBe('');
  });

  it('should center the element', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerHorizontally()
        .centerVertically(),
    });

    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should center the element with an offset', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerHorizontally('10px')
        .centerVertically('15px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginRight).toBe('');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginLeft).toBe('10px');
    expect(elementStyle.marginTop).toBe('15px');

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should center the element with an offset in rtl', () => {
    attachOverlay({
      direction: 'rtl',
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerHorizontally('10px')
        .centerVertically('15px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginRight).toBe('10px');
    expect(elementStyle.marginTop).toBe('15px');

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should make the element position: static', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector),
    });

    expect(overlayRef.overlayElement.style.position).toBe('static');
  });

  it('should wrap the element in a `cdk-global-overlay-wrapper`', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector),
    });

    const parent = overlayRef.overlayElement.parentNode as HTMLElement;

    expect(parent.classList.contains('cdk-global-overlay-wrapper')).toBe(true);
  });

  it('should remove the parent wrapper from the DOM', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector),
    });

    const parent = overlayRef.overlayElement.parentNode!;

    expect(document.body.contains(parent)).toBe(true);

    overlayRef.dispose();

    expect(document.body.contains(parent)).toBe(false);
  });

  it('should set the element width', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).width('100px'),
    });

    expect(overlayRef.overlayElement.style.width).toBe('100px');
  });

  it('should set the element height', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).height('100px'),
    });

    expect(overlayRef.overlayElement.style.height).toBe('100px');
  });

  it('should reset the horizontal position and offset when the width is 100%', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerHorizontally('10px')
        .width('100%'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('0px');
    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it(
    'should reset the horizontal position and offset when the width is 100% and the ' +
      'maxWidth is 100%',
    () => {
      attachOverlay({
        maxWidth: '100%',
        positionStrategy: createGlobalPositionStrategy(injector)
          .centerHorizontally('10px')
          .width('100%'),
      });

      const elementStyle = overlayRef.overlayElement.style;
      const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

      expect(elementStyle.marginLeft).toBe('0px');
      expect(parentStyle.justifyContent).toBe('flex-start');
    },
  );

  it(
    'should not reset the horizontal position and offset when the width is 100% and' +
      'there is a defined maxWidth',
    () => {
      attachOverlay({
        maxWidth: '500px',
        positionStrategy: createGlobalPositionStrategy(injector)
          .centerHorizontally('10px')
          .width('100%'),
      });

      const elementStyle = overlayRef.overlayElement.style;
      const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

      expect(elementStyle.marginLeft).toBe('10px');
      expect(parentStyle.justifyContent).toBe('center');
    },
  );

  it('should reset the vertical position and offset when the height is 100%', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerVertically('10px')
        .height('100%'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('0px');
    expect(parentStyle.alignItems).toBe('flex-start');
  });

  it(
    'should reset the vertical position and offset when the height is 100% and the ' +
      'maxHeight is 100%',
    () => {
      attachOverlay({
        maxHeight: '100%',
        positionStrategy: createGlobalPositionStrategy(injector)
          .centerVertically('10px')
          .height('100%'),
      });

      const elementStyle = overlayRef.overlayElement.style;
      const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

      expect(elementStyle.marginTop).toBe('0px');
      expect(parentStyle.alignItems).toBe('flex-start');
    },
  );

  it(
    'should not reset the vertical position and offset when the height is 100% and ' +
      'there is a defined maxHeight',
    () => {
      attachOverlay({
        maxHeight: '500px',
        positionStrategy: createGlobalPositionStrategy(injector)
          .centerVertically('10px')
          .height('100%'),
      });

      const elementStyle = overlayRef.overlayElement.style;
      const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

      expect(elementStyle.marginTop).toBe('10px');
      expect(parentStyle.alignItems).toBe('center');
    },
  );

  it('should not throw when attempting to apply after the overlay has been disposed', () => {
    const positionStrategy = createGlobalPositionStrategy(injector);

    attachOverlay({positionStrategy});

    positionStrategy.dispose();

    expect(() => positionStrategy.apply()).not.toThrow();
  });

  it('should take its width and height from the overlay config', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector),
      width: '500px',
      height: '300px',
    });

    const elementStyle = overlayRef.overlayElement.style;

    expect(elementStyle.width).toBe('500px');
    expect(elementStyle.height).toBe('300px');
  });

  it('should update the overlay size when setting it through the position strategy', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).width('500px').height('300px'),
    });

    expect(overlayRef.getConfig().width).toBe('500px');
    expect(overlayRef.getConfig().height).toBe('300px');
  });

  it(
    'should take the dimensions from the overlay config, when they are set both in the ' +
      'config and the strategy',
    () => {
      attachOverlay({
        positionStrategy: createGlobalPositionStrategy(injector).width('200px').height('100px'),
        width: '500px',
        height: '300px',
      });

      const elementStyle = overlayRef.overlayElement.style;

      expect(elementStyle.width).toBe('500px');
      expect(elementStyle.height).toBe('300px');
    },
  );

  it('should center the element in RTL', () => {
    attachOverlay({
      direction: 'rtl',
      positionStrategy: createGlobalPositionStrategy(injector)
        .centerHorizontally()
        .centerVertically(),
    });

    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;
    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should invert `justify-content` when using `left` in RTL', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).left('0'),
      direction: 'rtl',
    });

    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;
    expect(parentStyle.justifyContent).toBe('flex-end');
  });

  it('should invert `justify-content` when using `right` in RTL', () => {
    attachOverlay({
      positionStrategy: createGlobalPositionStrategy(injector).right('0'),
      direction: 'rtl',
    });

    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;
    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it('should clean up after itself when it has been disposed', () => {
    const positionStrategy = createGlobalPositionStrategy(injector).top('10px').left('40px');

    attachOverlay({positionStrategy});

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    positionStrategy.dispose();

    expect(elementStyle.marginTop).toBeFalsy();
    expect(elementStyle.marginLeft).toBeFalsy();
    expect(elementStyle.marginBottom).toBeFalsy();
    expect(elementStyle.marginBottom).toBeFalsy();
    expect(elementStyle.position).toBeFalsy();

    expect(parentStyle.justifyContent).toBeFalsy();
    expect(parentStyle.alignItems).toBeFalsy();
  });

  it('should position the overlay to the start in ltr', () => {
    attachOverlay({
      direction: 'ltr',
      positionStrategy: createGlobalPositionStrategy(injector).start('40px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('40px');
    expect(elementStyle.marginRight).toBe('');
    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it('should position the overlay to the start in rtl', () => {
    attachOverlay({
      direction: 'rtl',
      positionStrategy: createGlobalPositionStrategy(injector).start('50px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginRight).toBe('50px');
    expect(parentStyle.justifyContent).toBe('flex-start');
  });

  it('should position the overlay to the end in ltr', () => {
    attachOverlay({
      direction: 'ltr',
      positionStrategy: createGlobalPositionStrategy(injector).end('60px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginRight).toBe('60px');
    expect(elementStyle.marginLeft).toBe('');
    expect(parentStyle.justifyContent).toBe('flex-end');
  });

  it('should position the overlay to the end in rtl', () => {
    attachOverlay({
      direction: 'rtl',
      positionStrategy: createGlobalPositionStrategy(injector).end('70px'),
    });

    const elementStyle = overlayRef.overlayElement.style;
    const parentStyle = (overlayRef.overlayElement.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('70px');
    expect(elementStyle.marginRight).toBe('');
    expect(parentStyle.justifyContent).toBe('flex-end');
  });
});

@Component({
  template: '',
  imports: [OverlayModule, PortalModule],
})
class BlankPortal {}
