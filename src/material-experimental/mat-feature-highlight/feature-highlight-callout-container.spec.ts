/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentPortal, PortalModule, TemplatePortal} from '@angular/cdk/portal';
import {Component, NgModule, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {FeatureHighlightCalloutContainer} from './feature-highlight-callout-container';

describe('FeatureHighlightCalloutContainer', () => {
  let fixture: ComponentFixture<CalloutHostComponent>;
  let comp: CalloutHostComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CalloutContainerTestModule,
      ],
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(CalloutHostComponent);
    comp = fixture.debugElement.componentInstance;
  }));

  it('can attach template portal', () => {
    const portal = new TemplatePortal(comp.calloutTemplate, null!);
    comp.calloutContainer.attachTemplatePortal(portal);

    expect(fixture.debugElement.query(By.css('.callout-template-div')))
        .not.toBeNull();
  });

  it('can attach component portal', () => {
    const portal = new ComponentPortal(CalloutTestComponent);
    comp.calloutContainer.attachComponentPortal(portal);

    expect(fixture.debugElement.query(By.css('.callout-component-div')))
        .not.toBeNull();
  });

  it('cannot attach multiple template portals', () => {
    const portal = new TemplatePortal(comp.calloutTemplate, null!);
    comp.calloutContainer.attachTemplatePortal(portal);
    expect(() => comp.calloutContainer.attachTemplatePortal(portal))
        .toThrowError();
  });

  it('cannot attach multiple component portals', () => {
    const portal = new ComponentPortal(CalloutTestComponent);
    comp.calloutContainer.attachComponentPortal(portal);
    expect(() => comp.calloutContainer.attachComponentPortal(portal))
        .toThrowError();
  });

  it('detaches template portal on destroy', () => {
    const portal = new TemplatePortal(comp.calloutTemplate, null!);
    comp.calloutContainer.attachTemplatePortal(portal);
    fixture.destroy();

    expect(comp.calloutContainer.hasAttached()).toBe(false);
  });

  it('detaches component portal on destroy', () => {
    const portal = new ComponentPortal(CalloutTestComponent);
    comp.calloutContainer.attachComponentPortal(portal);
    fixture.destroy();

    expect(comp.calloutContainer.hasAttached()).toBe(false);
  });
});

@Component({
  template: `
      <feature-highlight-callout-container #calloutContainer>
      </feature-highlight-callout-container>
      <ng-template #calloutTemplate>
        <div class="callout-template-div"></div>
      </ng-template>
      `,
})
class CalloutHostComponent {
  @ViewChild('calloutContainer', {static: true})
  calloutContainer!: FeatureHighlightCalloutContainer;
  @ViewChild('calloutTemplate', {static: true})
  calloutTemplate!: TemplateRef<{}>;
}

@Component({template: '<div class="callout-component-div"></div>'})
class CalloutTestComponent {
}

@NgModule({
  declarations: [
    CalloutHostComponent,
    CalloutTestComponent,
    FeatureHighlightCalloutContainer,
  ],
  imports: [
    PortalModule,
  ],
  entryComponents: [
    CalloutTestComponent,
  ],
})
class CalloutContainerTestModule {
}
