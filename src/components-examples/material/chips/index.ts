import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

import {ChipsAutocompleteExample} from './chips-autocomplete/chips-autocomplete-example';
import {ChipsDragDropExample} from './chips-drag-drop/chips-drag-drop-example';
import {ChipsFormControlExample} from './chips-form-control/chips-form-control-example';
import {ChipsHarnessExample} from './chips-harness/chips-harness-example';
import {ChipsInputExample} from './chips-input/chips-input-example';
import {ChipsOverviewExample} from './chips-overview/chips-overview-example';
import {ChipsStackedExample} from './chips-stacked/chips-stacked-example';

export {
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsFormControlExample,
  ChipsHarnessExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample
};

const EXAMPLES = [
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  ChipsHarnessExample,
  ChipsFormControlExample,
];

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ChipsExamplesModule {
}
