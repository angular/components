import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectionModule} from '@angular/material-experimental/selection';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';

import {MatSelectionColumnExample} from './mat-selection-column/mat-selection-column-example';
import {MatSelectionListExample} from './mat-selection-list/mat-selection-list-example';

export {
  MatSelectionColumnExample,
  MatSelectionListExample,
};

const EXAMPLES = [
  MatSelectionListExample,
  MatSelectionColumnExample,
];

@NgModule({
  imports: [
    MatSelectionModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class MatSelectionExamplesModule {
}
