/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

/** Displays a set of material examples in a mat-accordion. */
@Component({
  selector: 'example-list-viewer',
  template: `
    <example-viewer *ngFor="let id of ids" [id]="id"></example-viewer>
  `,
  styles: [`
    mat-expansion-panel {
      box-shadow: none !important;
      border-radius: 0 !important;
      background: transparent;
      border-top: 1px solid #CCC;
    }

    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-right: 24px;
      align-items: center;
    }

    .id {
      font-family: monospace;
      color: #666;
      font-size: 12px;
    }
  `]
})
export class ExampleListViewer {
  /** IDs of the examples to display. */
  @Input() ids: string[];
}
