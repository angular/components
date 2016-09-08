import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MatTooltip} from '@angular2-material/tooltip';
import {OverlayContainer} from '@angular2-material/core';
import {MatTooltipModule} from './tooltip';


describe('MatTooltip', () => {
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule.forRoot()],
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
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MatTooltip);
    });

    it('should show/hide on mouse enter/leave', () => {
      expect(tooltipDirective.visible).toBeFalsy();

      tooltipDirective._handleMouseEnter(null);
      expect(tooltipDirective.visible).toBeTruthy();

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toBe('some message');

      tooltipDirective._handleMouseLeave(null);
      expect(overlayContainerElement.textContent).toBe('');
    });
  });
});

@Component({
  selector: 'app',
  template: `<button mat-tooltip="some message" [tooltip-position]="position">Button</button>`
})
class BasicTooltipDemo {
  position: TooltipPosition = 'below';
}
