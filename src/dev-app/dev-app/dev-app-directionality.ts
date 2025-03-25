/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {EventEmitter, Injectable, OnDestroy, signal} from '@angular/core';

@Injectable()
export class DevAppDirectionality implements Directionality, OnDestroy {
  readonly change = new EventEmitter<Direction>();

  get value(): Direction {
    return this.valueSignal();
  }
  set value(value: Direction) {
    this.valueSignal.set(value);
    this.change.next(value);
  }

  valueSignal = signal<Direction>('ltr');

  ngOnDestroy() {
    this.change.complete();
  }
}
