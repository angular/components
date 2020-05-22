import {NgModule} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';

import {CdkOverlayBasicExample} from './cdk-overlay-basic/cdk-overlay-basic-example';

export {CdkOverlayBasicExample};

const EXAMPLES = [CdkOverlayBasicExample];

@NgModule({
  imports: [OverlayModule, MatButtonModule, MatListModule, MatDividerModule, MatCardModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkOverlayExamplesModule {}
