import {CdkMenuModule} from '@angular/cdk-experimental/menu';
import {NgModule} from '@angular/core';

import {CdkMenuContextExample} from './cdk-menu-context/cdk-menu-context-example';
import {CdkMenuInlineExample} from './cdk-menu-inline/cdk-menu-inline-example';
import {CdkMenuMenubarExample} from './cdk-menu-menubar/cdk-menu-menubar-example';
import {
  CdkMenuStandaloneMenuExample
} from './cdk-menu-standalone-menu/cdk-menu-standalone-menu-example';
import {
  CdkMenuStandaloneStatefulMenuExample
} from './cdk-menu-standalone-stateful-menu/cdk-menu-standalone-stateful-menu-example';

export {
  CdkMenuContextExample,
  CdkMenuInlineExample,
  CdkMenuMenubarExample,
  CdkMenuStandaloneMenuExample,
  CdkMenuStandaloneStatefulMenuExample,
};

const EXAMPLES = [
  CdkMenuStandaloneMenuExample,
  CdkMenuMenubarExample,
  CdkMenuInlineExample,
  CdkMenuContextExample,
  CdkMenuStandaloneStatefulMenuExample,
];

@NgModule({
  imports: [CdkMenuModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkMenuExamplesModule {
}
