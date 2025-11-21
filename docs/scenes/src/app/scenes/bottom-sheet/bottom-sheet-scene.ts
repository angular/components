/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AfterViewInit, Component, ViewEncapsulation, inject} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-bottom-sheet-scene',
  template: '',
  styleUrls: ['./bottom-sheet-scene.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BottomSheetScene implements AfterViewInit {
  private _bottomSheet = inject(MatBottomSheet);

  ngAfterViewInit(): void {
    this._bottomSheet.open(SampleBottomSheet);
  }
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-bottom-sheet-scene',
  templateUrl: './bottom-sheet-scene.html',
  styleUrls: ['./bottom-sheet-scene.scss'],
  imports: [MatListModule, MatIconModule],
})
export class SampleBottomSheet {}
