/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkMenuModule} from '@angular/cdk/menu';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {
  CdkMenuContextExample,
  CdkMenuInlineExample,
  CdkMenuMenubarExample,
  CdkMenuNestedContextExample,
  CdkMenuStandaloneMenuExample,
  CdkMenuStandaloneStatefulMenuExample,
} from '@angular/components-examples/cdk/menu';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  templateUrl: 'cdk-menu-demo.html',
  styleUrl: 'cdk-menu-demo.css',
  standalone: true,
  imports: [
    CdkMenuModule,
    CommonModule,
    CdkMenuStandaloneMenuExample,
    CdkMenuStandaloneStatefulMenuExample,
    CdkMenuMenubarExample,
    CdkMenuInlineExample,
    CdkMenuContextExample,
    CdkMenuNestedContextExample,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkMenuDemo {
  customPosition = [
    {originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center'},
  ] as ConnectedPosition[];

  sizes = ['Small', 'Normal', 'Large'];
  colors = ['Red', 'Green', 'Blue'];
  selectedSize: string | undefined = 'Normal';
  selectedColor: string | undefined = 'Red';
}
