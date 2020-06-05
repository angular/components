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
import {MatCardModule} from '@angular/material/card';

/**
 * @title Card benchmark component.
 */
@Component({
  selector: 'app-root',
  template: `
    <button id="show" (click)="show()">Show</button>
    <button id="hide" (click)="hide()">Hide</button>

    <ng-container *ngIf="isVisible">
      <mat-card>Simple card</mat-card>
    </ng-container>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['//src/material/core/theming/prebuilt/indigo-pink.css'],
})
export class CardBenchmarkApp {
  isChecked = false;
  isVisible = false;

  show() { this.isVisible = true; }
  hide() { this.isVisible = false; }
}


@NgModule({
  declarations: [CardBenchmarkApp],
  imports: [
    A11yModule,
    BrowserModule,
    MatCardModule,
  ],
  providers: [],
  bootstrap: [CardBenchmarkApp]
})
export class AppModule {}
