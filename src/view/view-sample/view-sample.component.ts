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
  selector: 'ix-view-sample',
  exportAs: 'ix-view-sample',
  templateUrl: './view-sample.component.html',
  styleUrls: ['./view-sample.component.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'ix-view-sample'}
})
export class IXViewSampleComponent implements OnInit {

  constructor() { /* noop */ }

  ngOnInit() { /* noop */
  }

}
