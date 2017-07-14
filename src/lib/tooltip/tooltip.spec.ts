import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  MdTooltip,
  MdTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipComponent,
  TooltipPosition
} from './index';
import {AnimationEvent} from '@angular/animations';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Direction, Directionality} from '../core/bidi/index';
import {OverlayContainer, OverlayModule, Scrollable} from '../core/overlay/index';
import {Platform} from '../core/platform/platform';
import {dispatchFakeEvent} from '@angular/cdk/testing';

const initialTooltipMessage = 'initial tooltip message';

describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: Direction};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule, OverlayModule, NoopAnimationsModule],
      declarations: [BasicTooltipDemo, ScrollableTooltipDemo, OnPushTooltipDemo, A11yTooltipDemo],
      providers: [
        {provide: Platform, useValue: {IOS: false, isBrowser: true}},
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          document.body.appendChild(overlayContainerElement);
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Directionality, useFactory: () => {
          return dir = { value: 'ltr' };
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  afterEach(() => {
    document.body.removeChild(overlayContainerElement);
  });

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;
    let tooltipInstance: TooltipComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MdTooltip>(MdTooltip);
      tooltipInstance = tooltipDirective._tooltipInstance!;
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      // Check that the tooltip is not visible until after the default show delay (0ms)
      tooltipDirective.show();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Check that the tooltip is still visible until the default hide delay (0ms)
      tooltipDirective.hide();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should show with the tooltip message', fakeAsync(() => {
      tooltipDirective.show(0);
      tick(0);  // Tick the default show delay

      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);
    }));

    it('should show with delay', fakeAsync(() => {
      const tooltipDelay = 1000;
      tooltipDirective.show(tooltipDelay);

      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should hide with delay', fakeAsync(() => {
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      tooltipDirective.show(0);
      tick(0);  // Tick the default show delay
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should set a css class on the overlay panel element', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      const overlayRef = tooltipDirective._overlayRef;

      expect(overlayRef).not.toBeNull();
      expect(overlayRef!.overlayElement.classList).toContain(TOOLTIP_PANEL_CLASS,
          'Expected the overlay panel element to have the tooltip panel class set.');
    }));

    it('should not show if disabled', fakeAsync(() => {
      // Test that disabling the tooltip will not set the tooltip visible
      tooltipDirective.disabled = true;
      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // Test to make sure setting disabled to false will show the tooltip
      // Sanity check to make sure everything was correct before (detectChanges, tick)
      tooltipDirective.disabled = false;
      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should hide if disabled while visible', fakeAsync(() => {
      // Display the tooltip with a timeout before hiding.
      tooltipDirective.hideDelay = 1000;
      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Set tooltip to be disabled and verify that the tooltip hides before the set hide delay.
      tooltipDirective.disabled = true;
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not show if hide is called before delay finishes', fakeAsync(() => {
      const tooltipDelay = 1000;
      tooltipDirective.show(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      expect(overlayContainerElement.textContent).toContain('');

      tooltipDirective.hide();
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not show tooltip if message is not present or empty', fakeAsync(() => {
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      tooltipDirective.message = undefined!;
      tooltipDirective.show(0);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      tooltipDirective.message = null!;
      tooltipDirective.show(0);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      tooltipDirective.message = '';
      tooltipDirective.show(0);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      tooltipDirective.message = '   ';
      tooltipDirective.show(0);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // Control showing that the tooltip is visible due to the message content
      tooltipDirective.message = 'message';
      tooltipDirective.show(0);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should not follow through with hide if show is called after', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After hide called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Before delay time has passed, call show which should cancel intent to hide tooltip.
      tooltipDirective.show();
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should recreate the tooltip when changing position', () => {
      const initialPosition: TooltipPosition = 'below';
      const changedPosition: TooltipPosition = 'above';

      tooltipDirective.position = initialPosition;
      const initialOverlay = tooltipDirective._overlayRef;
      const initialTooltip = tooltipDirective._tooltipInstance;
      expect(tooltipDirective._tooltipInstance).toBeDefined();

      // Same position value should not remove the tooltip
      tooltipDirective.position = initialPosition;
      expect(tooltipDirective._overlayRef).toBe(initialOverlay);
      expect(tooltipDirective._tooltipInstance).toBe(initialTooltip);

      // Different position value should re-create the tooltip
      tooltipDirective.position = changedPosition;
      expect(tooltipDirective._overlayRef).not.toBe(initialOverlay);
      expect(tooltipDirective._tooltipInstance).not.toBe(initialTooltip);
    });

    it('should be able to modify the tooltip message', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._tooltipInstance!._visibility).toBe('visible');

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      const newMessage = 'new tooltip message';
      tooltipDirective.message = newMessage;

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(newMessage);
    }));

    it('should allow extra classes to be set on the tooltip', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      fixture.detectChanges();

      // Make sure classes aren't prematurely added
      let tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.classList).not.toContain('custom-one',
        'Expected to not have the class before enabling mdTooltipClass');
      expect(tooltipElement.classList).not.toContain('custom-two',
        'Expected to not have the class before enabling mdTooltipClass');

      // Enable the classes via ngClass syntax
      fixture.componentInstance.showTooltipClass = true;
      fixture.detectChanges();

      // Make sure classes are correctly added
      tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.classList).toContain('custom-one',
        'Expected to have the class after enabling mdTooltipClass');
      expect(tooltipElement.classList).toContain('custom-two',
        'Expected to have the class after enabling mdTooltipClass');
    }));

    it('should be removed after parent destroyed', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.destroy();
      expect(tooltipDirective._tooltipInstance).toBeNull();
      expect(tooltipDirective._scrollStrategy).toBeNull();
      expect(tooltipDirective._overlayRef).toBeNull();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should not try to dispose the tooltip when destroyed and done hiding', fakeAsync(() => {
      fixture.destroy();

      // Create an animation event that will propogate to the tooltip directive. Should not cause
      // any errors.
      tooltipInstance._afterVisibilityAnimation({
        fromState: 'visible',
        toState: 'hidden',
        totalTime: 150,
        phaseName: '',
      } as AnimationEvent);
    }));

    it('should consistently position before and after overlay origin in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOrigin = tooltipDirective._getOrigin();
      tooltipDirective.position = 'right';
      const rightOrigin = tooltipDirective._getOrigin();

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin()).toEqual(leftOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin()).toEqual(rightOrigin);

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin()).toEqual(rightOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin()).toEqual(leftOrigin);
    });

    it('should consistently position before and after overlay position in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOverlayPosition = tooltipDirective._getOverlayPosition();
      tooltipDirective.position = 'right';
      const rightOverlayPosition = tooltipDirective._getOverlayPosition();

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition()).toEqual(leftOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition()).toEqual(rightOverlayPosition);

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition()).toEqual(rightOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition()).toEqual(leftOverlayPosition);
    });

    it('should have consistent left transform origin in any dir', () => {
      tooltipDirective.position = 'right';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');

      tooltipDirective.position = 'after';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');

      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');
    });

    it('should have consistent right transform origin in any dir', () => {
      tooltipDirective.position = 'left';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');

      tooltipDirective.position = 'before';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');

      dir.value = 'rtl';
      tooltipDirective.position = 'after';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');
    });

    it('should throw when trying to assign an invalid position', () => {
      expect(() => {
        fixture.componentInstance.position = 'everywhere';
        fixture.detectChanges();
        tooltipDirective.show();
      }).toThrowError('Tooltip position "everywhere" is invalid.');
    });

    it('should pass the layout direction to the tooltip', fakeAsync(() => {
      dir.value = 'rtl';

      // Force tooltip to be recreated
      fixture.componentInstance.showButton = false;
      fixture.detectChanges();

      fixture.componentInstance.showButton = true;
      fixture.detectChanges();

      const tooltipWrapper = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

      expect(tooltipWrapper).toBeTruthy('Expected tooltip to be shown.');
      expect(tooltipWrapper.getAttribute('dir')).toBe('rtl', 'Expected tooltip to be in RTL mode.');
    }));

    it('should associate trigger and tooltip through aria-describedby', fakeAsync(() => {
      expect(tooltipInstance.id).toContain('md-tooltip-');

      const trigger = fixture.componentInstance.trigger.nativeElement;
      expect(trigger.getAttribute('aria-describedBy')).toContain('md-tooltip-');

      // Destroying the component should reset the aria described by
      fixture.destroy();
      expect(trigger.getAttribute('aria-describedBy')).not.toContain('md-tooltip-');
    }));

    it('should not override existing aria-describedby', fakeAsync(() => {
      const a11yfixture = TestBed.createComponent(A11yTooltipDemo);
      a11yfixture.detectChanges();

      const trigger = a11yfixture.componentInstance.trigger.nativeElement;
      expect(trigger.getAttribute('aria-describedBy')).toBe('existing-describedby');

      // Destroying the component should not reset the aria described by
      fixture.destroy();
      expect(trigger.getAttribute('aria-describedBy')).toBe('existing-describedby');
    }));
  });

  describe('scrollable usage', () => {
    let fixture: ComponentFixture<ScrollableTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(ScrollableTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MdTooltip>(MdTooltip);
    });

    it('should hide tooltip if clipped after changing positions', fakeAsync(() => {
      // Show the tooltip and tick for the show delay (default is 0)
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      // Expect that the tooltip is displayed
      expect(tooltipDirective._isTooltipVisible())
          .toBe(true, 'Expected tooltip to be initially visible');

      // Scroll the page but tick just before the default throttle should update.
      fixture.componentInstance.scrollDown();
      tick(SCROLL_THROTTLE_MS - 1);
      expect(tooltipDirective._isTooltipVisible())
          .toBe(true, 'Expected tooltip to be visible when scrolling, before throttle limit');

      // Finish ticking to the throttle's limit and check that the scroll event notified the
      // tooltip and it was hidden.
      tick(100);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible())
          .toBe(false, 'Expected tooltip hidden when scrolled out of view, after throttle limit');
    }));
  });

  describe('with OnPush', () => {
    let fixture: ComponentFixture<OnPushTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(OnPushTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MdTooltip>(MdTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      // Check that the tooltip is not visible until after the default show delay (0ms)
      tooltipDirective.show();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Check that the tooltip is still visible until the default hide delay (0ms)
      tooltipDirective.hide();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should have rendered the tooltip text on init', fakeAsync(() => {
      dispatchFakeEvent(buttonElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);

      const tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.textContent).toContain('initial tooltip message');
    }));
  });

});

@Component({
  selector: 'app',
  template: `
    <button *ngIf="showButton"
            #trigger
            [mdTooltip]="message"
            [mdTooltipPosition]="position"
            [mdTooltipClass]="{'custom-one': showTooltipClass, 'custom-two': showTooltipClass }">
      Button
    </button>`
})
class BasicTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
  showButton: boolean = true;
  @ViewChild('trigger') trigger: ElementRef;
  showTooltipClass = false;
  @ViewChild(MdTooltip) tooltip: MdTooltip;
}

@Component({
  selector: 'app',
  template: `
    <button #trigger aria-describedby="existing-describedby" [mdTooltip]="message">
      Button
    </button>`
})
class A11yTooltipDemo {
  @ViewChild('trigger') trigger: ElementRef;
}

@Component({
     selector: 'app',
     template: `
    <div cdk-scrollable style="padding: 100px; margin: 300px;
                               height: 200px; width: 200px; overflow: auto;">
      <button *ngIf="showButton" style="margin-bottom: 600px"
              [md-tooltip]="message"
              [tooltip-position]="position">
        Button
      </button>
    </div>`
})
class ScrollableTooltipDemo {
 position: string = 'below';
 message: string = initialTooltipMessage;
 showButton: boolean = true;

 @ViewChild(Scrollable) scrollingContainer: Scrollable;

 scrollDown() {
     const scrollingContainerEl = this.scrollingContainer.getElementRef().nativeElement;
     scrollingContainerEl.scrollTop = 250;

     // Emit a scroll event from the scrolling element in our component.
     // This event should be picked up by the scrollable directive and notify.
     // The notification should be picked up by the service.
     dispatchFakeEvent(scrollingContainerEl, 'scroll');
   }
}

@Component({
  selector: 'app',
  template: `
    <button [mdTooltip]="message"
            [mdTooltipPosition]="position">
      Button
    </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class OnPushTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
}
