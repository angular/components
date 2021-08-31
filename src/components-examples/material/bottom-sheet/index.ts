import {NgModule} from '@angular/core';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';

import {BottomSheetHarnessExample} from './bottom-sheet-harness/bottom-sheet-harness-example';
import {
  BottomSheetOverviewExample,
  BottomSheetOverviewExampleSheet
} from './bottom-sheet-overview/bottom-sheet-overview-example';

export {
  BottomSheetHarnessExample,
  BottomSheetOverviewExample,
  BottomSheetOverviewExampleSheet,
};

const EXAMPLES = [
  BottomSheetHarnessExample,
  BottomSheetOverviewExample,
  BottomSheetOverviewExampleSheet,
];

@NgModule({
  imports: [
    MatBottomSheetModule,
    MatButtonModule,
    MatListModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class BottomSheetExamplesModule {
}
