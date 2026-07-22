/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, forwardRef, input, viewChild} from '@angular/core';
import {DocViewer} from '../doc-viewer/doc-viewer';

@Component({
  selector: 'code-snippet',
  templateUrl: './code-snippet.html',
  styleUrls: ['./example-viewer.scss'],
  imports: [forwardRef(() => DocViewer)],
})
export class CodeSnippet {
  readonly source = input<string>();
  readonly viewer = viewChild.required<DocViewer>('viewer');
}
