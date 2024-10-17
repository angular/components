/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, TemplateRef, ViewChild, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';

const defaultConfig = new MatBottomSheetConfig();

@Component({
  selector: 'bottom-sheet-demo',
  styleUrl: 'bottom-sheet-demo.css',
  templateUrl: 'bottom-sheet-demo.html',
  imports: [
    FormsModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetDemo {
  private _bottomSheet = inject(MatBottomSheet);

  config: MatBottomSheetConfig = {
    hasBackdrop: defaultConfig.hasBackdrop,
    disableClose: defaultConfig.disableClose,
    backdropClass: defaultConfig.backdropClass,
    direction: 'ltr',
    ariaLabel: 'Example bottom sheet',
  };

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  openComponent() {
    this._bottomSheet.open(ExampleBottomSheet, this.config);
  }

  openTemplate() {
    this._bottomSheet.open(this.template, this.config);
  }
}

@Component({
  template: `
    <mat-nav-list>
      @for (action of [1, 2, 3]; track action) {
        <a href="#" mat-list-item (click)="handleClick($event)">
          <span matListItemTitle>Action {{ action }}</span>
          <span matListItemLine>Description</span>
        </a>
      }
    </mat-nav-list>
  `,
  imports: [MatListModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleBottomSheet {
  private _bottomSheet = inject(MatBottomSheetRef);

  handleClick(event: MouseEvent) {
    event.preventDefault();
    this._bottomSheet.dismiss();
  }
}
