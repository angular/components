/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';

/** Stores the data needed to make a template update. */
export interface Update {
  /** The location of the update. */
  location: compiler.ParseLocation;

  /** A function to be used to update the template. */
  updateFn: (html: string) => string;
}

export abstract class TemplateMigrator {
  /** Stores template updates. By default gets returned by #getUpdates. */
  protected updates: Update[] = [];

  /** Preorder callback hook for the template AST traversal. */
  preorder(node: compiler.TmplAstElement): void {}

  /** Postorder callback hook for the template AST traversal. */
  postorder(node: compiler.TmplAstElement): void {}

  /** Returns the data needed to update the given node. */
  getUpdates(): Update[] {
    return this.updates;
  }

  /** Runs once a template has finished being updated. */
  reset(): void {
    this.updates = [];
  }
}
