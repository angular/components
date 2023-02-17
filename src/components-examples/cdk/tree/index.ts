import {CdkTreeModule} from '@angular/cdk/tree';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CdkTreeFlatExample} from './cdk-tree-flat/cdk-tree-flat-example';
import {CdkTreeFlatLevelAccessorExample} from './cdk-tree-flat-level-accessor/cdk-tree-flat-level-accessor-example';
import {CdkTreeNestedExample} from './cdk-tree-nested/cdk-tree-nested-example';

export {CdkTreeFlatExample, CdkTreeNestedExample, CdkTreeFlatLevelAccessorExample};

const EXAMPLES = [CdkTreeFlatExample, CdkTreeNestedExample, CdkTreeFlatLevelAccessorExample];

@NgModule({
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkTreeExamplesModule {}
