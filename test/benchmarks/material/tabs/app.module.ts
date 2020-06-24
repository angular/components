/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  template: `
    <button id="show-small-tab-group" (click)="showSmallTabGroup()">Show Small Tab Group</button>
    <button id="show-large-tab-group" (click)="showLargeTabGroup()">Show Large Tab Group</button>
    <button id="hide" (click)="hide()">Hide</button>

    <mat-tab-group *ngIf="isSmallTabGroupVisible">
      <mat-tab label="First"> Content 1 </mat-tab>
      <mat-tab label="Second"> Content 2 </mat-tab>
      <mat-tab label="Third"> Content 3 </mat-tab>
    </mat-tab-group>

    <mat-tab-group *ngIf="isLargeTabGroupVisible">
      <mat-tab label="First"> Content 1 </mat-tab>
      <mat-tab label="Second"> Content 2 </mat-tab>
      <mat-tab label="Third"> Content 3 </mat-tab>
      <mat-tab label="Fourth"> Content 4 </mat-tab>
      <mat-tab label="Fifth"> Content 5 </mat-tab>
      <mat-tab label="Sixth"> Content 6 </mat-tab>
      <mat-tab label="Seventh"> Content 7 </mat-tab>
      <mat-tab label="Eigth"> Content 8 </mat-tab>
      <mat-tab label="Ninth"> Content 9 </mat-tab>
      <mat-tab label="Tenth"> Content 10 </mat-tab>
    </mat-tab-group>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class TabsBenchmarkApp {
  isSmallTabGroupVisible = false;
  isLargeTabGroupVisible = false;

  showSmallTabGroup() { this.isSmallTabGroupVisible = true; }
  showLargeTabGroup() { this.isLargeTabGroupVisible = true; }

  hide() {
    this.isSmallTabGroupVisible = false;
    this.isLargeTabGroupVisible = false;
  }
}


@NgModule({
  declarations: [TabsBenchmarkApp],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [TabsBenchmarkApp],
})
export class AppModule {}
