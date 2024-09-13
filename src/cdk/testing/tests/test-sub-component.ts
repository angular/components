/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'test-sub',
  template: `
      <h2>List of {{title}}</h2>
      <ul>
        @for (item of items; track item) {
          <li>{{item}}</li>
        }
      </ul>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TestSubComponent {
  @Input() title: string;
  @Input() items: string[];
}
