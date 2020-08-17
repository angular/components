import {NgModule} from '@angular/core';
import {
  CdkScrollableTableBodyModule,
} from '@angular/cdk-experimental/scrollable-table-body/scrollable-table-body-module';
import {
  MatScrollableTableBodyFlexExample,
} from './mat-scrollable-table-body-flex/mat-scrollable-table-body-flex-example';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';

export {
  MatScrollableTableBodyFlexExample,
};

const EXAMPLES = [
  MatScrollableTableBodyFlexExample,
];

@NgModule({
  imports: [
    CdkScrollableTableBodyModule,
    MatButtonModule,
    MatTableModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class MatScrollableTableBodyExamplesModule {
}
