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

import {FeatureHighlightOverlay} from './feature-highlight-overlay';

describe('FeatureHighlightOverlay', () => {
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

  it('can pass a container element', () => {
    const element = document.createElement('div');
    comp.overlay.setContainerElement(element);

    expect(comp.overlay.getContainerElement()).toBe(element);
  });
});

@Component({template: ''})
class TestComponent {
  constructor(readonly overlay: FeatureHighlightOverlay) {}
}
