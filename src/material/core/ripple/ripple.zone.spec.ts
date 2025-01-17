import {dispatchMouseEvent} from '@angular/cdk/testing/private';
import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatRippleModule} from '.';
import {MatRipple} from './ripple';

describe('MatRipple Zone.js integration', () => {
  let fixture: ComponentFixture<any>;
  let rippleTarget: HTMLElement;
  let originalBodyMargin: string | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatRippleModule, BasicRippleContainer],
    });
  });

  beforeEach(() => {
    // Set body margin to 0 during tests so it doesn't mess up position calculations.
    originalBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
  });

  afterEach(() => {
    document.body.style.margin = originalBodyMargin!;
  });

  describe('basic ripple', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('.mat-ripple');
    });

    it('does not run events inside the NgZone', () => {
      const spy = jasmine.createSpy('zone unstable callback');
      const subscription = fixture.ngZone!.onUnstable.subscribe(spy);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });
  });
});

@Component({
  template: `
      <div id="container" #ripple="matRipple" matRipple
           style="position: relative; width:300px; height:200px;">
      </div>
    `,
  imports: [MatRippleModule],
})
class BasicRippleContainer {
  @ViewChild('ripple') ripple: MatRipple;
}
