/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FeatureHighlight} from './feature-highlight';
import {FeatureHighlightRef} from './feature-highlight-ref';
import {FeatureHighlightModule} from './module';

describe('FeatureHighlightContentDirectives', () => {
  let fixture: ComponentFixture<TestComponent>;
  let featureHighlight: FeatureHighlight;
  let comp: TestComponent;
  let ref: FeatureHighlightRef;

  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          imports: [
            FeatureHighlightContentDirectivesTestModule,
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    comp = fixture.debugElement.componentInstance;
    featureHighlight = TestBed.inject(FeatureHighlight);

    ref = featureHighlight.open(comp.calloutTemplateRef, {
      targetViewContainerRef: comp.targetViewContainerRef,
    });
    fixture.detectChanges();
  });

  it('sets zIndex and position for the target element when enabled', () => {
    comp.enabled = true;
    fixture.detectChanges();

    const targetElement =
        comp.targetViewContainerRef.element.nativeElement as HTMLElement;
    expect(targetElement.style.zIndex).toBe('1001');
    expect(targetElement.style.position).toBe('relative');
  });

  it('does not set zIndex or position for the target element when disabled',
     () => {
       comp.enabled = false;
       fixture.detectChanges();

       const targetElement =
           comp.targetViewContainerRef.element.nativeElement as HTMLElement;
       expect(targetElement.style.zIndex).toBe('');
       expect(targetElement.style.position).toBe('');
     });

  it('closes feature highlight by clicking on the close button', () => {
    const afterDismissedCallback = jasmine.createSpy('afterDismissed');
    ref.afterDismissed().subscribe(afterDismissedCallback);

    fixture.debugElement.query(By.css('button[featureHighlightClose]'))
        .nativeElement.click();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(afterDismissedCallback).toHaveBeenCalledTimes(1);
    });
  });

  it('sets aria labelled by for feature highlight container', async(() => {
       fixture.whenStable().then(() => {
         const container =
             fixture.debugElement.query(By.css('feature-highlight-container'))
                 .nativeElement;

         expect(container.getAttribute('aria-labelledby'))
             .toBe('feature-highlight-title-id');
         expect(container.getAttribute('aria-describedby'))
             .toBe('feature-highlight-content-id');
       });
     }));
});

@Component({
  template: `
    <div #target featureHighlightTarget [featureHighlightEnabled]="enabled">
    </div>
    <ng-template #calloutTemplate>
      <div featureHighlightTitle id="feature-highlight-title-id">
        Add your favorite thing
      </div>
      <div featureHighlightContent id="feature-highlight-content-id">
        Tap the add icon to add your favorites
      </div>
      <button featureHighlightClose aria-label="close-button-aria-label">
        Got it
      </button>
    </ng-template>
  `,
})
class TestComponent {
  @ViewChild('calloutTemplate', {static: true})
  calloutTemplateRef!: TemplateRef<{}>;

  @ViewChild('target', {read: ViewContainerRef, static: true})
  targetViewContainerRef!: ViewContainerRef;

  enabled = true;
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
class FeatureHighlightContentDirectivesTestModule {
}
