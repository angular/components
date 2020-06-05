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
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Chips benchmark component.
 */
@Component({
  selector: 'app-root',
  template: `
    <button id="show-single" (click)="showSingle()">Show Single</button>
    <button id="hide-single" (click)="hideSingle()">Hide Single</button>

    <button id="show-multiple" (click)="showMultiple()">Show Multiple</button>
    <button id="hide-multiple" (click)="hideMultiple()">Hide Multiple</button>

    <ng-container *ngIf="isSingleVisible">
      <mat-chip>One</mat-chip>
    </ng-container>

    <ng-container *ngIf="isMultipleVisible">
      <mat-chip-list>
        <mat-chip>One</mat-chip>
        <mat-chip>Two</mat-chip>
        <mat-chip>Three</mat-chip>
        <mat-chip>Four</mat-chip>
        <mat-chip>Five</mat-chip>
        <mat-chip>Six</mat-chip>
      </mat-chip-list>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class ChipsBenchmarkApp {
  isSingleVisible = false;
  isMultipleVisible = false;

  showSingle() { this.isSingleVisible = true; }
  hideSingle() { this.isSingleVisible = false; }

  showMultiple() { this.isMultipleVisible = true; }
  hideMultiple() { this.isMultipleVisible = false; }
}


@NgModule({
  declarations: [ChipsBenchmarkApp],
  imports: [
    A11yModule,
    BrowserModule,
    MatChipsModule,
  ],
  providers: [],
  bootstrap: [ChipsBenchmarkApp]
})
export class AppModule {}
