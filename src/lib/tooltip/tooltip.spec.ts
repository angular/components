import {async, ComponentFixture, TestBed, tick, fakeAsync} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MdTooltip, MATERIAL_TOOLTIP_HIDE_DELAY} from './tooltip';
import {OverlayContainer} from '../core';
import {MdTooltipModule} from './tooltip';

const initialTooltipMessage = 'initial tooltip message';

describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule.forRoot()],
      declarations: [BasicTooltipDemo],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MdTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      expect(tooltipDirective._tooltipRef).toBeUndefined();

      tooltipDirective.show();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      tooltipDirective.hide();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After hidden, expect that the tooltip is not visible.
      tick(MATERIAL_TOOLTIP_HIDE_DELAY);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should remove the tooltip when changing position', () => {
      const initialPosition: TooltipPosition = 'below';
      const changedPosition: TooltipPosition = 'above';

      expect(tooltipDirective._tooltipRef).toBeUndefined();

      tooltipDirective.position = initialPosition;
      tooltipDirective.show();
      expect(tooltipDirective._tooltipRef).toBeDefined();

      // Same position value should not remove the tooltip
      tooltipDirective.position = initialPosition;
      expect(tooltipDirective._tooltipRef).toBeDefined();

      // Different position value should destroy the tooltip
      tooltipDirective.position = changedPosition;
      expect(tooltipDirective._tooltipRef).toBeNull();
      expect(tooltipDirective._overlayRef).toBeNull();
    });

    it('should be able to modify the tooltip message', () => {
      expect(tooltipDirective._tooltipRef).toBeUndefined();

      tooltipDirective.show();
      expect(tooltipDirective._tooltipRef._visibility).toBe('visible');

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      const newMessage = 'new tooltip message';
      tooltipDirective.message = newMessage;

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(newMessage);
    });

    it('should be removed after parent destroyed', () => {
      tooltipDirective._handleMouseEnter(null);
      expect(tooltipDirective.visible).toBeTruthy();
      fixture.destroy();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    });
  });
});

@Component({
  selector: 'app',
  template: `<button [md-tooltip]="message" [tooltip-position]="position">Button</button>`
})
class BasicTooltipDemo {
  position: TooltipPosition = 'below';
  message: string = initialTooltipMessage;
}
