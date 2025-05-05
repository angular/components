/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, model} from '@angular/core';
import {CdkLink, CdkNav} from '@angular/cdk-experimental/nav';

@Component({
  selector: 'cdk-nav-example',
  templateUrl: 'cdk-nav-example.html',
  styleUrl: 'cdk-nav-example.css',
  standalone: true,
  imports: [CdkNav, CdkLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkNavExample {
  selectedValue = model<string[]>(['/home']); // Default selected value

  links = [
    {label: 'Home', path: '/home'},
    {label: 'Settings', path: '/settings'},
    {label: 'Profile', path: '/profile', disabled: true},
    {label: 'Admin', path: '/admin'},
  ];
}
