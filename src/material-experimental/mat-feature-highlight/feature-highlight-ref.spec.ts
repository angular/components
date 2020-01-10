import {Component, Inject, Injector, NgModule, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FEATURE_HIGHLIGHT_DATA, FeatureHighlight} from './feature-highlight';
import {FeatureHighlightOverlayContainer} from './feature-highlight-overlay-container';
import {FeatureHighlightRef} from './feature-highlight-ref';
import {FeatureHighlightModule} from './module';

describe('FeatureHighlightRef', () => {
  let featureHighlight: FeatureHighlight;
  let overlayContainer: FeatureHighlightOverlayContainer;

  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          imports: [
            FeatureHighlightTestModule,
          ],
        })
        .compileComponents();

    featureHighlight = TestBed.inject(FeatureHighlight);
    overlayContainer = TestBed.inject(FeatureHighlightOverlayContainer);
  }));

  it('opens feature highlight with a template', () => {
    const fixture = TestBed.createComponent(ComponentWithCalloutTemplate);
    const ref = featureHighlight.open(
        fixture.debugElement.componentInstance.calloutTemplateRef, {
          targetViewContainerRef:
              fixture.debugElement.componentInstance.targetViewContainerRef,
        });
    fixture.detectChanges();

    const calloutElement = ref.containerInstance.callout.nativeElement;
    expect(calloutElement.textContent).toContain('Add your favorite thing');
  });

  it('opens feature highlight with a component', () => {
    const fixture = TestBed.createComponent(ComponentWithTargetViewContainer);
    const ref = featureHighlight.open(CalloutComponent, {
      targetViewContainerRef:
          fixture.debugElement.componentInstance.targetViewContainerRef,
    });
    fixture.detectChanges();

    const calloutElement = ref.containerInstance.callout.nativeElement;
    expect(calloutElement.textContent).toContain('Add your favorite thing');
    expect(ref.calloutInstance instanceof CalloutComponent).toBe(true);
  });

  it('opens feature highlight with overlay if outer circle is not bounded',
     () => {
       const fixture = TestBed.createComponent(ComponentWithCalloutTemplate);
       featureHighlight.open(
           fixture.debugElement.componentInstance.calloutTemplateRef, {
             targetViewContainerRef:
                 fixture.debugElement.componentInstance.targetViewContainerRef,
             isOuterCircleBounded: false,
           });
       fixture.detectChanges();

       const overlayContainerElement = overlayContainer.getContainerElement();

       expect(
           overlayContainerElement.classList.contains('cdk-overlay-container'))
           .toBe(true);
       expect(overlayContainerElement.textContent)
           .toContain('Add your favorite thing');
     });

  it('removes overlay container after feature highlight is dismissed', () => {
    const fixture = TestBed.createComponent(ComponentWithTargetViewContainer);
    const ref = featureHighlight.open(CalloutComponent, {
      targetViewContainerRef:
          fixture.debugElement.componentInstance.targetViewContainerRef,
      isOuterCircleBounded: false,
    });

    ref.dismiss();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.cdk-overlay-container')))
        .toBeNull();
  });

  it('removes overlay container after feature highlight is accepted', () => {
    const fixture = TestBed.createComponent(ComponentWithTargetViewContainer);
    const ref = featureHighlight.open(CalloutComponent, {
      targetViewContainerRef:
          fixture.debugElement.componentInstance.targetViewContainerRef,
      isOuterCircleBounded: false,
    });

    ref.accept();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.cdk-overlay-container')))
        .toBeNull();
  });

  it('opens feature highlight without overlay if outer circle is bounded',
     () => {
       const fixture = TestBed.createComponent(ComponentWithCalloutTemplate);
       featureHighlight.open(
           fixture.debugElement.componentInstance.calloutTemplateRef, {
             targetViewContainerRef:
                 fixture.debugElement.componentInstance.targetViewContainerRef,
             isOuterCircleBounded: true,
           });
       fixture.detectChanges();

       expect(overlayContainer.getContainerElement()).toBeUndefined();
     });

  it('uses injector from target view container ref', () => {
    const fixture = TestBed.createComponent(ComponentWithTargetViewContainer);
    const ref = featureHighlight.open(CalloutComponent, {
      targetViewContainerRef:
          fixture.debugElement.componentInstance.targetViewContainerRef,
    });
    fixture.detectChanges();

    expect(ref.calloutInstance.featureHighlightRef).toBe(ref);

    const calloutInjector = ref.calloutInstance.calloutInjector;
    expect(calloutInjector.get<CalloutComponent>(CalloutComponent))
        .toBeTruthy(
            'Expect the callout component to be created with the injector ' +
            'from the target view container');
  });

  it('notifies observers after feature highlight is opened', async(() => {
       const fixture =
           TestBed.createComponent(ComponentWithTargetViewContainer);
       const ref = featureHighlight.open(CalloutComponent, {
         targetViewContainerRef:
             fixture.debugElement.componentInstance.targetViewContainerRef,
       });

       const afterOpenedCallback = jasmine.createSpy('afterOpenedCallback');
       ref.afterOpened().subscribe(afterOpenedCallback);
       fixture.detectChanges();
       fixture.whenStable().then(() => {
         expect(afterOpenedCallback).toHaveBeenCalledTimes(1);
       });
     }));

  it('notifies observers after feature highlight is dismissed', async(() => {
       const fixture =
           TestBed.createComponent(ComponentWithTargetViewContainer);
       const ref = featureHighlight.open(CalloutComponent, {
         targetViewContainerRef:
             fixture.debugElement.componentInstance.targetViewContainerRef,
       });

       const afterDismissedCallback =
           jasmine.createSpy('afterDismissedCallback');
       ref.afterDismissed().subscribe(afterDismissedCallback);
       ref.dismiss();
       fixture.detectChanges();
       fixture.whenStable().then(() => {
         expect(afterDismissedCallback).toHaveBeenCalledTimes(1);
       });
     }));

  it('notifies observers after feature highlight is accepted', async(() => {
       const fixture =
           TestBed.createComponent(ComponentWithTargetViewContainer);
       const ref = featureHighlight.open(CalloutComponent, {
         targetViewContainerRef:
             fixture.debugElement.componentInstance.targetViewContainerRef,
       });

       const afterAcceptedCallback = jasmine.createSpy('afterAcceptedCallback');
       ref.afterAccepted().subscribe(afterAcceptedCallback);
       ref.accept();
       fixture.detectChanges();
       fixture.whenStable().then(() => {
         expect(afterAcceptedCallback).toHaveBeenCalledTimes(1);
       });
     }));

  it('should be able to pass data to callout component', () => {
    const fixture = TestBed.createComponent(ComponentWithTargetViewContainer);
    const data = {
      stringParam: 'hello',
      numberParam: 123,
    };
    const ref = featureHighlight.open(CalloutWithInjectedData, {
      targetViewContainerRef:
          fixture.debugElement.componentInstance.targetViewContainerRef,
      data,
    });

    expect(ref.calloutInstance.data).toEqual(data);
  });

  it('should dismiss feature highlight with overlay via escape key',
     async(() => {
       const fixture =
           TestBed.createComponent(ComponentWithTargetViewContainer);
       const ref = featureHighlight.open(CalloutComponent, {
         targetViewContainerRef:
             fixture.debugElement.componentInstance.targetViewContainerRef,
         isOuterCircleBounded: false,
       });

       const afterDismissedCallback =
           jasmine.createSpy('afterDismissedCallback');
       ref.afterDismissed().subscribe(afterDismissedCallback);

       // Trigger an escape key press event.
       document.body.dispatchEvent(new KeyboardEvent(
           /* type= */ 'keydown', {key: 'Escape', bubbles: true}));
       fixture.detectChanges();
       fixture.whenStable().then(() => {
         expect(afterDismissedCallback).toHaveBeenCalledTimes(1);
       });
     }));
});

@Component({
  template: `
    <div #target></div>
    <ng-template #calloutTemplate>
      <h1>Add your favorite thing</h1>
    </ng-template>
  `,
})
class ComponentWithCalloutTemplate {
  @ViewChild('calloutTemplate', {static: true})
  calloutTemplateRef!: TemplateRef<{}>;
  @ViewChild('target', {read: ViewContainerRef, static: true})
  targetViewContainerRef!: ViewContainerRef;
}

@Component({
  template: `
    <h1>Add your favorite thing</h1>
  `,
})
class CalloutComponent {
  constructor(
      readonly calloutInjector: Injector,
      readonly featureHighlightRef: FeatureHighlightRef<CalloutComponent>) {}
}

@Component({
  template: `
    <div #target></div>
  `,
})
class ComponentWithTargetViewContainer {
  @ViewChild('target', {read: ViewContainerRef, static: true})
  targetViewContainerRef!: ViewContainerRef;
}

@Component({template: ''})
class CalloutWithInjectedData {
  constructor(@Inject(FEATURE_HIGHLIGHT_DATA) readonly data: {}) {}
}

@NgModule({
  declarations: [
    CalloutComponent,
    CalloutWithInjectedData,
    ComponentWithCalloutTemplate,
    ComponentWithTargetViewContainer,
  ],
  imports: [
    FeatureHighlightModule,
    NoopAnimationsModule,
  ],
  entryComponents: [
    CalloutWithInjectedData,
    CalloutComponent,
    ComponentWithCalloutTemplate,
    ComponentWithTargetViewContainer,
  ],
})
class FeatureHighlightTestModule {
}
