/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule, InputModality, InputModalityDetector} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'input-modality-detector-demo',
  templateUrl: 'input-modality-detector-demo.html',
  standalone: true,
  imports: [
    A11yModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputModalityDetectorDemo implements OnDestroy {
  _modality: InputModality = null;
  _destroyed = new Subject<void>();
  readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    const inputModalityDetector = inject(InputModalityDetector);
    const ngZone = inject(NgZone);

    inputModalityDetector.modalityChanged.pipe(takeUntil(this._destroyed)).subscribe(modality =>
      ngZone.run(() => {
        this._modality = modality;
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
