import {NgModule} from '@angular/core';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTableModule as CdkExperimentalTableModule} from '@angular/cdk-experimental/table';
import {ScrollingModule} from '@angular/cdk/scrolling';

import {CdkVirtualTableExample} from './cdk-virtual-table/cdk-virtual-table-example';
import {CdkVirtualFlexTableExample} from './cdk-virtual-flex-table/cdk-virtual-flex-table-example';

export {
  CdkVirtualTableExample,
  CdkVirtualFlexTableExample,
};

const EXAMPLES = [
  CdkVirtualTableExample,
  CdkVirtualFlexTableExample,
];

@NgModule({
  imports: [
    CdkTableModule,
    CdkExperimentalTableModule,
    ScrollingModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkTableExamplesModule {}
