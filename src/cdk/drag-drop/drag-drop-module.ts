/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {NgModule} from '@angular/core';

import {CdkDrag} from './directives/drag';
import {CdkDragHandle} from './directives/drag-handle';
import {CdkDragPlaceholder} from './directives/drag-placeholder';
import {CdkDragPreview} from './directives/drag-preview';
import {CdkDropList} from './directives/drop-list';
import {CdkDropListGroup} from './directives/drop-list-group';
import {DragDrop} from './drag-drop';

@NgModule({
  declarations: [
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
  exports: [
    CdkScrollableModule,
    CdkDropList,
    CdkDropListGroup,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
  ],
  providers: [
    DragDrop,
  ]
})
export class DragDropModule {
}
