import {NgModule} from '@angular/core';
import {CdkTableModule} from '@angular/cdk/table';
import {
  CdkScrollableTableBodyModule,
} from '@angular/cdk-experimental/scrollable-table-body/scrollable-table-body-module';
import {
  CdkScrollableTableBodyFlexExample,
} from './cdk-scrollable-table-body-flex/cdk-scrollable-table-body-flex-example';
import {MatButtonModule} from '@angular/material/button';

export {
  CdkScrollableTableBodyFlexExample,
};

const EXAMPLES = [
  CdkScrollableTableBodyFlexExample,
];

@NgModule({
  imports: [
    CdkScrollableTableBodyModule,
    CdkTableModule,
    MatButtonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkScrollableTableBodyExamplesModule {
}
