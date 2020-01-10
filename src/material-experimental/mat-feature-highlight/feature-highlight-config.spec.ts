/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewContainerRef} from '@angular/core';

import {FeatureHighlightConfig} from './feature-highlight-config';

describe('FeatureHighlightConfig', () => {
  it('can override configurations from constructor', () => {
    const mockTargetViewContainerRef =
        jasmine.createSpyObj<ViewContainerRef>('viewContainerRef', ['get']);

    const overriddenConfig: FeatureHighlightConfig<{}> = {
      calloutPosition: 'top_start',
      calloutLeft: '100px',
      calloutTop: '200px',
      innerCircleDiameter: '300px',
      outerCircleDiameter: '400px',
      isOuterCircleBounded: true,
      targetViewContainerRef: mockTargetViewContainerRef,
      data: {
        someProperty: 'someValue',
      },
      ariaDescribedBy: 'ariaDescribedByValue',
      ariaLabel: 'ariaLabel',
      ariaLabelledBy: 'ariaLabeledByValue',
    };

    const config = new FeatureHighlightConfig<{}>(overriddenConfig);

    for (const k of Object.keys(config)) {
      const key = k as keyof FeatureHighlightConfig<{}>;
      expect(config[key]).toEqual(overriddenConfig[key]);
    }
  });
});
