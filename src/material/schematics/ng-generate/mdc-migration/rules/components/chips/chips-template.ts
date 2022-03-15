/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator, Update} from '../../template-migrator';
import {replaceStartTag, replaceEndTag, visitElements} from '../../tree-traversal';

export class ChipsTemplateMigrator extends TemplateMigrator {
  chipInputAttrs: compiler.TmplAstBoundAttribute[] = [];

  getUpdates(node: compiler.TmplAstElement): Update[] {
    if (node.name === 'mat-chip-list') {
      return this.buildChipListUpdates(node);
    }

    if (node.name === 'input') {
      this.storeChipRefs(node);
    }

    return [];
  }

  override onComplete(): void {
    this.chipInputAttrs = [];
  }

  /**
   * Returns start and end tag updates for the given node.
   *
   * The updates returned are conditionally determined by whether the given chipListNode is going
   * to become a mat-chip-grid or a mat-chip-listbox.
   *
   * @param node The node to update.
   * @param chipListNode The node to evaluate as either a grid or listbox.
   * @param gridTag The new tag name if the chipListNode is a grid.
   * @param listboxTag The new tag name if the chipListNode is a listbox.
   * @returns The start and end tag updates for the given node.
   */
  private buildUpdates(node: compiler.TmplAstElement, chipListNode: compiler.TmplAstElement, gridTag: string, listboxTag: string): Update[] {
    return [
      {
        location: node.startSourceSpan.start,
        updateFn: html => {
          return this.isChipGrid(chipListNode)
            ? replaceStartTag(html, node, gridTag)
            : replaceStartTag(html, node, listboxTag);
        },
      },
      {
        location: node.endSourceSpan!.start,
        updateFn: html => {
          return this.isChipGrid(chipListNode)
            ? replaceEndTag(html, node, gridTag)
            : replaceEndTag(html, node, listboxTag);
        },
      },
    ];
  }

  /** Stores the matChipInputFor references on given input. */
  private storeChipRefs(node: compiler.TmplAstElement): void {
    for (let i = 0; i < node.inputs.length; i++) {
      if (node.inputs[i].name === 'matChipInputFor') {
        this.chipInputAttrs.push(node.inputs[i]);
      }
    }
  }

  /**
   * Builds and returns the updates for the given
   * mat-chip-list node as well as any mat-chip-lists it contains.
   */
  private buildChipListUpdates(node: compiler.TmplAstElement): Update[] {
    return [
      ...this.buildUpdates(node, node, 'mat-chip-grid', 'mat-chip-listbox'),
      ...this.buildChipUpdates(node),
    ];
  }

  /** Builds and returns the updates for the mat-chips inside the given mat-chip-list node. */
  private buildChipUpdates(node: compiler.TmplAstElement): Update[] {
    const updates: Update[] = [];

    // Recursively check the children of the mat-chip-list for mat-chip elements.
    const handleMatChipUpdates = (child: compiler.TmplAstElement) => {
      if (child.name !== 'mat-chip') {
        visitElements(child.children, handleMatChipUpdates);
        return;
      }

      // Update each mat-chip depending on whether the
      // base mat-chip-list is referenced by an input.
      updates.push(
        ...this.buildUpdates(child, node, 'mat-chip-row', 'mat-chip-option')
      );
    }

    visitElements(node.children, handleMatChipUpdates);
    return updates;
  }

  /**
   * Returns whether the given node should be a mat-chip-grid or mat-chip-listbox.
   *
   * This is determined by whether the given mat-chip-list is referenced by any inputs. If it is,
   * then the node is a mat-chip-grid. Otherwise, it is a mat-chip-listbox.
   */
  private isChipGrid(node: compiler.TmplAstElement): boolean {
    return node.references.some(ref => {
      return this.chipInputAttrs.some(attr => {
        const value = attr.value as compiler.ASTWithSource;
        return value.source === ref.name;
      });
    });
  }
}
