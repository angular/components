import {A11yModule} from '@angular/cdk/a11y';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {
  FocusMonitorDirectivesExample
} from './focus-monitor-directives/focus-monitor-directives-example';
import {
  FocusMonitorFocusViaExample
} from './focus-monitor-focus-via/focus-monitor-focus-via-example';
import {FocusMonitorOverviewExample} from './focus-monitor-overview/focus-monitor-overview-example';

export {FocusMonitorDirectivesExample, FocusMonitorFocusViaExample, FocusMonitorOverviewExample};

const EXAMPLES = [
  FocusMonitorDirectivesExample,
  FocusMonitorFocusViaExample,
  FocusMonitorOverviewExample,
];

@NgModule({
  imports: [
    A11yModule,
    MatButtonModule,
    MatSelectModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkA11yExamplesModule {
}

