/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {CDK_CONTEXT_MENU_DEFAULT_OPTIONS} from '@angular/cdk-experimental/menu';

@Component({
  templateUrl: 'cdk-menu-demo.html',
  styleUrls: ['cdk-menu-demo.css'],
})
export class CdkMenuDemo {}

@Directive({
  selector: 'demo-custom-position',
  providers: [
    {
      provide: CDK_CONTEXT_MENU_DEFAULT_OPTIONS,
      useValue: {
        preferredPositions: [
          {originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center'},
        ],
      },
    },
  ],
})
export class DemoCustomMenuOptions {}
