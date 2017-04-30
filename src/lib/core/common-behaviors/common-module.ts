import {NgModule} from '@angular/core';
import {CompatibilityModule} from '../compatibility/compatibility';
import {MdDisabled} from './disabled';


/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, compatibility mode, etc.
 *
 * This module should be imported to each top-level component module (e.g., MdTabsModule).
 */
@NgModule({
  imports: [CompatibilityModule],
  exports: [CompatibilityModule, MdDisabled],
  declarations: [MdDisabled]
})
export class MdCommonModule { }
