/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Component, NgModule, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {async} from '@angular/core/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FeatureHighlight} from './feature-highlight';
import {FeatureHighlightCalloutPosition, FeatureHighlightConfig} from './feature-highlight-config';
import {FeatureHighlightModule} from './module';

describe('FeatureHighlightContainer', () => {
  let fixture: ComponentFixture<TestComponent>;
  let featureHighlight: FeatureHighlight;
  let comp: TestComponent;

  let isOuterCircleBounded: boolean;
  let innerCircleDiameter: number;
  let directionality: {value: string};

  const CALLOUT_WIDTH = 400;
  const CALLOUT_HEIGHT = 270;

  beforeEach(async(() => {
    // All the tests below depend on math that is much nice to read when the
    // body does not have a margin.
    document.body.style.margin = '0';
    directionality = {value: 'ltr'};

    TestBed
        .configureTestingModule({
          imports: [
            FeatureHighlightContainerTestModule,
          ],
          providers: [
            {
              provide: Directionality,
              useFactory: () => directionality,
            },
          ],
        })
        .compileComponents();
  }));

  for (const direction of ['ltr', 'rtl']) {
    describe(`with ${direction}`, () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        comp = fixture.debugElement.componentInstance;
        featureHighlight = TestBed.inject(FeatureHighlight);

        directionality.value = direction;
        document.dir = direction;
        innerCircleDiameter = 60;
        fixture.detectChanges();
      });

      describe('with bounded outer circle', () => {
        beforeEach(() => {
          isOuterCircleBounded = true;
          fixture.detectChanges();
        });

        runSharedTestsForBoundedAndUnboundedOuterCircle();

        it('positions root element to overlay with the target element',
           async(() => {
             featureHighlight.open(comp.calloutTemplateRef, {
               targetViewContainerRef: comp.targetViewContainerRef,
               innerCircleDiameter,
               isOuterCircleBounded,
             });
             fixture.detectChanges();
             const rootDivElement = getRootDiv();
             const targetElement =
                 comp.targetViewContainerRef.element.nativeElement;

             // By default target's parent has display: block, so the root div
             // of feature highlight is positioned under the target element.
             // Thus the left of the root div is the same as the target, and
             // the top is moved up with a negative value of target height.
             expect(getOffsetLeft(rootDivElement))
                 .toBe(getOffsetLeft(targetElement));
             expect(rootDivElement.offsetTop).toBe(-20);
           }));

        it('positions callout at top start against the target element', () => {
          featureHighlight.open(comp.calloutTemplateRef, {
            targetViewContainerRef: comp.targetViewContainerRef,
            innerCircleDiameter,
            isOuterCircleBounded,
            calloutPosition: 'top_start',
          });
          fixture.detectChanges();

          const callout = getCallout();
          expect(callout.offsetWidth).toBe(CALLOUT_WIDTH);
          expect(callout.offsetHeight).toBe(CALLOUT_HEIGHT);
          // Align the end of the callout with the center of the target.
          expect(getOffsetLeft(callout)).toBe(-380);  // = -400 + 40 / 2
          // Align the bottom of the callout with the top of the inner circle.
          expect(callout.offsetTop).toBe(-290);  // = -270 - (60 - 20) / 2
        });

        it('positions callout at top end against the target element', () => {
          featureHighlight.open(comp.calloutTemplateRef, {
            targetViewContainerRef: comp.targetViewContainerRef,
            innerCircleDiameter,
            isOuterCircleBounded,
            calloutPosition: 'top_end',
          });
          fixture.detectChanges();

          const callout = getCallout();
          expect(callout.offsetWidth).toBe(CALLOUT_WIDTH);
          expect(callout.offsetHeight).toBe(CALLOUT_HEIGHT);
          // Align the start of the callout with the center of the target.
          expect(getOffsetLeft(callout)).toBe(20);  // = 40 / 2
          // Align the bottom of the callout with the top of the inner circle.
          expect(callout.offsetTop).toBe(-290);  // = -270 - (60 - 20) / 2
        });

        it('positions callout at bottom start against the target element',
           () => {
             featureHighlight.open(comp.calloutTemplateRef, {
               targetViewContainerRef: comp.targetViewContainerRef,
               innerCircleDiameter,
               isOuterCircleBounded,
               calloutPosition: 'bottom_start',
             });
             fixture.detectChanges();

             const callout = getCallout();
             expect(callout.offsetWidth).toBe(CALLOUT_WIDTH);
             expect(callout.offsetHeight).toBe(CALLOUT_HEIGHT);
             // Align the end of the callout with the center of the target.
             expect(getOffsetLeft(callout)).toBe(-380);  // = -400 + 40 / 2
             // Align the top of the callout with the bottom of the inner
             // circle.
             expect(callout.offsetTop).toBe(40);  // = 60 / 2 + 20 / 2
           });

        it('positions callout at bottom end against the target element', () => {
          featureHighlight.open(comp.calloutTemplateRef, {
            targetViewContainerRef: comp.targetViewContainerRef,
            innerCircleDiameter,
            isOuterCircleBounded,
            calloutPosition: 'bottom_end',
          });
          fixture.detectChanges();

          const callout = getCallout();
          expect(callout.offsetWidth).toBe(CALLOUT_WIDTH);
          expect(callout.offsetHeight).toBe(CALLOUT_HEIGHT);
          // Align the start of the callout with the center of the target.
          expect(getOffsetLeft(callout)).toBe(20);  // = 40 / 2
          // Align the top of the callout with the bottom of the inner circle.
          expect(callout.offsetTop).toBe(40);  // = 60 / 2 + 20 / 2
        });

        for (const calloutPosition
                 of ['top_start', 'top_end', 'bottom_start', 'bottom_end']) {
          it('centers outer circle with the target element when ' +
                 `calloutPosition is ${calloutPosition}`,
             () => {
               const config = new FeatureHighlightConfig({
                 targetViewContainerRef: comp.targetViewContainerRef,
                 innerCircleDiameter,
                 isOuterCircleBounded,
                 calloutPosition: 'top_start',
               });
               const ref =
                   featureHighlight.open(comp.calloutTemplateRef, config);
               fixture.detectChanges();

               const outerCircle = getOuterCircle();

               const position =
                   calloutPosition as FeatureHighlightCalloutPosition;
               ref.updateLayout({calloutPosition: position});
               fixture.detectChanges();

               // Radius is Math.hypot(400, 270 + 60 / 2) = 500 so diameter is
               // 1000.
               expect(outerCircle.offsetWidth).toBe(1000);
               expect(outerCircle.offsetHeight).toBe(1000);
               expect(getOffsetLeft(outerCircle))
                   .toBe(-480);  // = -500 + 40 / 2 = -480
               expect(outerCircle.offsetTop)
                   .toBe(-490);  // = -500 + 20 / 2 = -490
             });
        }
      });

      describe('with unbounded outer circle', () => {
        beforeEach(() => {
          isOuterCircleBounded = false;
          fixture.detectChanges();
        });

        runSharedTestsForBoundedAndUnboundedOuterCircle();

        it('positions callout based on config values', () => {
          featureHighlight.open(comp.calloutTemplateRef, {
            targetViewContainerRef: comp.targetViewContainerRef,
            innerCircleDiameter,
            isOuterCircleBounded,
            calloutLeft: -200,
            calloutTop: 100,
          });
          fixture.detectChanges();

          const callout = getCallout();
          expect(callout.offsetWidth).toBe(CALLOUT_WIDTH);
          expect(callout.offsetHeight).toBe(CALLOUT_HEIGHT);
          expect(callout.offsetLeft).toBe(-200);
          expect(callout.offsetTop).toBe(100);
        });

        it('positions outer circle based on an inscribed rectangle that ' +
               'includes both inner circle and callout',
           () => {
             const ref = featureHighlight.open(comp.calloutTemplateRef, {
               targetViewContainerRef: comp.targetViewContainerRef,
               innerCircleDiameter,
               isOuterCircleBounded,
               // Callout is at the bottom end position against the target
               // element.
               calloutLeft: -10,
               calloutTop: 10,
             });
             fixture.detectChanges();

             const innerCircle = getInnerCircle();
             const outerCircle = getOuterCircle();

             // Since target element is at the center of inner circle, and top
             // left of target element is (0, 0), innerCircle offsetLeft is:
             // (targetWidth - innerCircleDiameter) / 2 =  (40 - 60) / 2 = -10
             // innerCircle offsetTop is:
             // (targetHeight - innerCircleDiameter) / 2 = (20 - 60) / 2 = -20.
             expect(getOffsetLeft(innerCircle)).toBe(-10);
             expect(innerCircle.offsetTop).toBe(-20);

             // Position of the inscribed rectangle is calculated as follows:
             // left = min(innerCircle.offsetLeft, calloutLeft)
             //      = min(-10, -10)
             //      = -10
             // top = min(innerCircle.offsetTop, calloutTop)
             //     = min(-20, 10)
             //     = -20
             // right
             //     = max(
             //         innerCircle.offsetLeft + innerCircle.offsetWidth,
             //         callout.offsetLeft + callout.offsetWidth)
             //     = max(-10 + 60, -10 + 400)
             //     = 390
             // bottom
             //     = max(
             //        innerCircle.offsetTop + innerCircle.offsetHeight,
             //        callout.offsetTop + callout.offsetHeight,
             //     = max(-20 + 60, 10 + 270))
             //     = 280
             // width = right - left = 390 - (-10) = 400
             // height = bottom - top = 280 - (-20) = 300
             //
             // Therefore, for outer circle:
             // diameter = Math.hypot(rectangle.width, rectangle.height) = 500
             // left = rectangle.center.left - outerCircle.radius
             //      = rectangle.left + rectangle.width / 2 - outerCircle.radius
             //      = -10 + 400 / 2 - 500 / 2
             //      = -60
             // top = rectangle.center.top - outerCircle.radius
             //     = rectangle.center.top + rectangle.height / 2 -
             //           outerCircle.radius
             //     = -20 + 300 / 2 - 500 / 2
             //     = -120
             expect(outerCircle.offsetWidth).toBe(500);
             expect(outerCircle.offsetHeight).toBe(500);
             expect(getOffsetLeft(outerCircle)).toBe(-60);
             expect(outerCircle.offsetTop).toBe(-120);

             // Callout is at the bottom start position against the target
             // element.
             ref.updateLayout({
               calloutLeft: -350,
               calloutTop: 10,
             });
             fixture.detectChanges();

             expect(outerCircle.offsetWidth).toBe(500);
             expect(outerCircle.offsetHeight).toBe(500);
             expect(getOffsetLeft(outerCircle)).toBe(-400);
             expect(outerCircle.offsetTop).toBe(-120);

             // Callout is at the top start position against the target element.
             ref.updateLayout({
               calloutLeft: -350,
               calloutTop: -260,
             });
             fixture.detectChanges();

             expect(outerCircle.offsetWidth).toBe(500);
             expect(outerCircle.offsetHeight).toBe(500);
             expect(getOffsetLeft(outerCircle)).toBe(-400);
             expect(outerCircle.offsetTop).toBe(-360);

             // Callout is at the top end position against the target element.
             ref.updateLayout({
               calloutLeft: -10,
               calloutTop: -260,
             });
             fixture.detectChanges();

             expect(outerCircle.offsetWidth).toBe(500);
             expect(outerCircle.offsetHeight).toBe(500);
             expect(getOffsetLeft(outerCircle)).toBe(-60);
             expect(outerCircle.offsetTop).toBe(-360);
           });
      });
    });
  }

  /**
   * Run shared tests, regardless of whether the outer circle is bounded.
   */
  function runSharedTestsForBoundedAndUnboundedOuterCircle() {
    it('allows outer circle diameter to be specified', () => {
      featureHighlight.open(comp.calloutTemplateRef, {
        targetViewContainerRef: comp.targetViewContainerRef,
        innerCircleDiameter,
        isOuterCircleBounded,
        outerCircleDiameter: 1000,
      });
      fixture.detectChanges();

      const outerCircle = getOuterCircle();

      expect(outerCircle.offsetWidth).toBe(1000);
      expect(outerCircle.offsetHeight).toBe(1000);
    });

    it('dismisses feature highlight if body is clicked', async(() => {
         const ref = featureHighlight.open(comp.calloutTemplateRef, {
           targetViewContainerRef: comp.targetViewContainerRef,
           isOuterCircleBounded,
         });
         fixture.detectChanges();

         const afterDismissedCallback = jasmine.createSpy('afterDismissed');
         ref.afterDismissed().subscribe(afterDismissedCallback);
         document.body.click();
         fixture.detectChanges();
         fixture.whenStable().then(() => {
           expect(afterDismissedCallback).toHaveBeenCalledTimes(1);

           // Ensure that the event listener on body is removed.
           document.body.click();
           fixture.detectChanges();
           fixture.whenStable().then(() => {
             expect(afterDismissedCallback).toHaveBeenCalledTimes(1);
           });
         });
       }));

    it('accepts feature highlgiht if target element is clicked', () => {
      const ref = featureHighlight.open(comp.calloutTemplateRef, {
        targetViewContainerRef: comp.targetViewContainerRef,
        isOuterCircleBounded,
      });
      fixture.detectChanges();

      const afterAcceptedCallback = jasmine.createSpy('afterAccepted');
      ref.afterAccepted().subscribe(afterAcceptedCallback);

      const targetElement = comp.targetViewContainerRef.element.nativeElement;
      targetElement.click();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(afterAcceptedCallback).toHaveBeenCalledTimes(1);

        // Ensure that the event listener on the target element is removed.
        targetElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(afterAcceptedCallback).toHaveBeenCalledTimes(1);
        });
      });
    });

    it('centers inner circle with the target element', () => {
      featureHighlight.open(comp.calloutTemplateRef, {
        targetViewContainerRef: comp.targetViewContainerRef,
        innerCircleDiameter,
        isOuterCircleBounded,
      });
      fixture.detectChanges();

      const innerCircle = getInnerCircle();

      expect(innerCircle.offsetWidth).toBe(innerCircleDiameter);
      expect(innerCircle.offsetHeight).toBe(innerCircleDiameter);
      expect(getOffsetLeft(innerCircle)).toBe(-10);  // = (-60 + 40) / 2
      expect(innerCircle.offsetTop).toBe(-20);       // = (-60 + 20) / 2;
    });

    it('centers radial pulse with the target element', () => {
      featureHighlight.open(comp.calloutTemplateRef, {
        targetViewContainerRef: comp.targetViewContainerRef,
        innerCircleDiameter,
        isOuterCircleBounded,
      });
      fixture.detectChanges();

      const radialPulse = getRadialPulse();
      expect(radialPulse.offsetWidth).toBe(innerCircleDiameter);
      expect(radialPulse.offsetHeight).toBe(innerCircleDiameter);
      expect(getOffsetLeft(radialPulse)).toBe(-10);  // (-60 + 40) / 2 = -10
      expect(radialPulse.offsetTop).toBe(-20);       // = (-60 + 20) / 2;
    });
  }

  function getRootDiv(): HTMLElement {
    return fixture.debugElement
        .query(By.css('.feature-highlight-container-div'))
        .nativeElement;
  }

  function getInnerCircle(): HTMLElement {
    return fixture.debugElement.query(By.css('.feature-highlight-inner-circle'))
        .nativeElement;
  }

  function getRadialPulse(): HTMLElement {
    return fixture.debugElement.query(By.css('.feature-highlight-radial-pulse'))
        .nativeElement;
  }

  function getCallout(): HTMLElement {
    return fixture.debugElement.query(By.css('.feature-highlight-callout'))
        .nativeElement;
  }

  function getOuterCircle(): HTMLElement {
    return fixture.debugElement.query(By.css('.feature-highlight-outer-circle'))
        .nativeElement;
  }

  /**
   * Return the offset left in LTR, and "offset right" in RTL, which should have
   * the same value.
   */
  function getOffsetLeft(element: HTMLElement): number {
    if (directionality.value === 'ltr') {
      return element.offsetLeft;
    } else {
      return -(element.offsetLeft + element.offsetWidth);
    }
  }
});

@Component({
  template: `
    <div #target [style.width.px]="40" [style.height.px]="20"></div>
    <ng-template #calloutTemplate>
      <div
          [style.width.px]="400"
          [style.height.px]="270">
        Add your favorite thing
      </div>
    </ng-template>
  `,
})
class TestComponent {
  @ViewChild('calloutTemplate', {static: true})
  calloutTemplateRef!: TemplateRef<{}>;
  @ViewChild('target', {read: ViewContainerRef, static: true})
  targetViewContainerRef!: ViewContainerRef;
}

@NgModule({
  declarations: [
    TestComponent,
  ],
  imports: [
    FeatureHighlightModule,
    NoopAnimationsModule,
  ],
  entryComponents: [
    TestComponent,
  ],
})
class FeatureHighlightContainerTestModule {
}
