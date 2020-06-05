/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatMenuModule} from '@angular/material/menu';

/** component: mat-menu */

@Component({
  selector: 'app-root',
  template: `
    <button mat-button [matMenuTriggerFor]="menu">Menu</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item 1</button>
      <button mat-menu-item>Item 2</button>
      <button mat-menu-item>Item 3</button>
      <button mat-menu-item>Item 4</button>
      <button mat-menu-item>Item 5</button>
      <button mat-menu-item>Item 6</button>
      <button mat-menu-item>Item 7</button>
      <button mat-menu-item>Item 8</button>
      <button mat-menu-item>Item 9</button>
      <button mat-menu-item>Item 10</button>
    </mat-menu>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class MenuBenchmarkApp {
}


@NgModule({
  declarations: [MenuBenchmarkApp],
  imports: [
    A11yModule,
    BrowserModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [MenuBenchmarkApp]
})
export class AppModule {}
