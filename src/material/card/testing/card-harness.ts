/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CardHarnessFilters} from './card-harness-filters';


/** Harness for interacting with a standard mat-card in tests. */
export class MatCardHarness extends ComponentHarness {
  /** The selector for the host element of a `MatCard` instance. */
  static hostSelector = 'mat-card';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatCardHarness` that meets
   * certain criteria.
   * @param options Options for filtering which card instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CardHarnessFilters = {}): HarnessPredicate<MatCardHarness> {
    return new HarnessPredicate(MatCardHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Gets the cards's text content. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
