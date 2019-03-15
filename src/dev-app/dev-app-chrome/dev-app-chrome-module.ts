import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {DevAppChrome} from './dev-app-chrome';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
  ],
  declarations: [DevAppChrome],
  exports: [DevAppChrome],
})
export class DevAppChromeModule {
}
