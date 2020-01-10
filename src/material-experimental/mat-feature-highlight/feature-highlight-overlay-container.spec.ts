/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayModule} from '@angular/cdk/overlay';
import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';

import {FeatureHighlightOverlayContainer} from './feature-highlight-overlay-container';

describe('FeatureHighlightOverlayContainer', () => {
  let comp: TestComponent;

  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          declarations: [
            TestComponent,
          ],
          imports: [
            OverlayModule,
          ],
        })
        .compileComponents();

    const fixture = TestBed.createComponent(TestComponent);

    comp = fixture.debugElement.componentInstance;
  }));

  it('does not create a container element by default', () => {
    expect(comp.overlayContainer.getContainerElement()).toBeUndefined();
  });

  it('can pass a container element', () => {
    const element = document.createElement('div');
    comp.overlayContainer.setContainerElement(element);

    expect(comp.overlayContainer.getContainerElement()).toEqual(element);
  });
});

@Component({template: ''})
class TestComponent {
  constructor(readonly overlayContainer: FeatureHighlightOverlayContainer) {}
}
