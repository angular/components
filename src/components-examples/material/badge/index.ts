import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

import {BadgeHarnessExample} from './badge-harness/badge-harness-example';
import {BadgeOverviewExample} from './badge-overview/badge-overview-example';

export {BadgeHarnessExample, BadgeOverviewExample};

const EXAMPLES = [BadgeOverviewExample, BadgeHarnessExample];

@NgModule({
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class BadgeExamplesModule {
}
