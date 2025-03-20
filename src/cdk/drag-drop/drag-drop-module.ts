/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {CdkScrollableModule} from '../scrolling';
import {CdkDropList} from './directives/drop-list';
import {CdkDropListGroup} from './directives/drop-list-group';
import {CdkDrag} from './directives/drag';
import {CdkDragHandle} from './directives/drag-handle';
import {CdkDragPreview} from './directives/drag-preview';
import {CdkDragPlaceholder} from './directives/drag-placeholder';
import {DragDrop} from './drag-drop';

const DRAG_DROP_DIRECTIVES = [
  CdkDropList,
  CdkDropListGroup,
  CdkDrag,
  CdkDragHandle,
  CdkDragPreview,
  CdkDragPlaceholder,
];

@NgModule({
  imports: DRAG_DROP_DIRECTIVES,
  exports: [CdkScrollableModule, ...DRAG_DROP_DIRECTIVES],
  providers: [DragDrop],
})
export class DragDropModule {}

// Re-export needed by the Angular compiler.
// See: https://github.com/angular/components/issues/30663.
// Note: These exports need to be stable and shouldn't be renamed unnecessarily because
// consuming libraries might have references to them in their own partial compilation output.
export {CdkScrollable as ɵɵCdkScrollable} from '../scrolling';
