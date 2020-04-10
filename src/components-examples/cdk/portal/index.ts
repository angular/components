import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {
  CdkPortalOverviewExample,
  ComponentPortalExample
} from './cdk-portal-overview/cdk-portal-overview-example';
import {MatButtonModule} from '@angular/material/button';
export {CdkPortalOverviewExample, ComponentPortalExample};

const EXAMPLES = [
  CdkPortalOverviewExample,
  ComponentPortalExample,
];

@NgModule({
  imports: [
    PortalModule,
    MatButtonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkPortalExamplesModule {
}
