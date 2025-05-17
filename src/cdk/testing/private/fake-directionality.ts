/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Direction, Directionality} from '@angular/cdk/bidi';
import {EventEmitter, signal, WritableSignal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {skip} from 'rxjs/operators';

// Note: ngOnDestroy not needed, but must include it to match the Directionality interface.
// Implementing the interface ensures the fake stays in sync with the real API.
// tslint:disable-next-line:no-undecorated-class-with-angular-features lifecycle-hook-interface
class FakeDirectionality implements Directionality {
  readonly change: EventEmitter<Direction>;

  get value(): Direction {
    return this.valueSignal();
  }

  constructor(readonly valueSignal: WritableSignal<Direction>) {
    this.change = toObservable(valueSignal).pipe(skip(1)) as EventEmitter<Direction>;
  }

  ngOnDestroy() {}
}

export function provideFakeDirectionality(direction: Direction | WritableSignal<Direction>) {
  return {
    provide: Directionality,
    useFactory: () =>
      new FakeDirectionality(typeof direction === 'string' ? signal(direction) : direction),
    deps: [],
  };
}
