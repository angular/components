/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';

/**
 * Mapping of CDK component names to their Angular Aria documentation URLs.
 */
const ANGULAR_ARIA_LINKS: Record<string, string> = {
  'listbox': 'https://angular.dev/guide/aria/listbox',
  'tree': 'https://angular.dev/guide/aria/tree',
  'accordion': 'https://angular.dev/guide/aria/accordion',
  'menu': 'https://angular.dev/guide/aria/menu',
};

/**
 * Banner component that guides users to use the new Angular Aria components for CDK components
 * that have equivalent Angular Aria components.
 */
@Component({
  selector: 'angular-aria-banner',
  templateUrl: 'angular-aria-banner.html',
  styleUrl: 'angular-aria-banner.css',
})
export class AngularAriaBanner {
  @Input() componentName: string = '';

  get ariaLink(): string {
    return ANGULAR_ARIA_LINKS[this.componentName.toLowerCase()] || '';
  }
}
