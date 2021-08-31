/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InputModality, InputModalityDetector} from '@angular/cdk/a11y';
import {Component, NgZone, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'input-modality-detector-demo',
  templateUrl: 'input-modality-detector-demo.html',
})
export class InputModalityDetectorDemo implements OnDestroy {
  _modality: InputModality = null;
  _destroyed = new Subject<void>();

  constructor(
      inputModalityDetector: InputModalityDetector,
      ngZone: NgZone,
  ) {
    inputModalityDetector.modalityChanged.pipe(takeUntil(this._destroyed))
        .subscribe(modality => ngZone.run(() => {
          this._modality = modality;
        }));
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
