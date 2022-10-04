import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {CookiePopup} from './cookie-popup';

@NgModule({
  imports: [CommonModule, MatButtonModule],
  declarations: [CookiePopup],
  exports: [CookiePopup]
})
export class CookiePopupModule {}
