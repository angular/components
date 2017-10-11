/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'ix-component-sample',
  exportAs: 'ix-component-sample',
  templateUrl: './component-sample.component.html',
  styleUrls: ['./component-sample.component.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'ix-component-sample'}
})
export class IXComponentSampleComponent implements OnInit {

  constructor() { /* noop */ }

  ngOnInit() { /* noop */
  }

}
