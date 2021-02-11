import {NgModule} from '@angular/core';
import {
  CdkScrollableTableBodyModule,
} from '@angular/cdk-experimental/table/scrollable-table-body-module';
import {
  MatScrollableTableBodyFlexExample,
} from './mat-scrollable-table-body-flex/mat-scrollable-table-body-flex-example';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatScrollableTableBodyModule} from '@angular/material-experimental/table';

export {
  MatScrollableTableBodyFlexExample,
};

const EXAMPLES = [
  MatScrollableTableBodyFlexExample,
];

@NgModule({
  imports: [
    CdkScrollableTableBodyModule,
    MatScrollableTableBodyModule,
    MatButtonModule,
    MatTableModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class MatScrollableTableBodyExamplesModule {
}
