/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator, Update} from '../../template-migrator';
import {replaceStartTag, replaceEndTag} from '../../tree-traversal';

/** Stores a mat-chip-list with the mat-chip elements nested within it. */
interface ChipMap {
  chipList: compiler.TmplAstElement;
  chips: compiler.TmplAstElement[];
}

export class ChipsTemplateMigrator extends TemplateMigrator {
  /** The matChipInputFor attributes found while traversing the template ast. */
  private _chipInputAttrs: compiler.TmplAstBoundAttribute[] = [];

  /** The current ChipMap being built. */
  private _chipMap: ChipMap | null;

  /** Contains all of the ChipMaps found while traversing the template ast. */
  private _chipMaps: ChipMap[] = [];

  override postorder(node: compiler.TmplAstElement): void {
    if (node.name === 'mat-chip-list') {
      this._chipMaps.push(this._chipMap!);
      this._chipMap = null;
    }
  }

  override preorder(node: compiler.TmplAstElement): void {
    switch (node.name) {
      case 'mat-chip-list':
        this._handleChipListNode(node);
        break;
      case 'mat-chip':
        this._handleChipNode(node);
        break;
      case 'input':
        this._storeChipRefs(node);
        break;
    }
  }

  override getUpdates(): Update[] {
    this._chipMaps.forEach(chipMap => {
      chipMap.chips.forEach(chip => {
        this.updates.push(
          ...this._buildUpdates(chip, chipMap.chipList, 'mat-chip-row', 'mat-chip-option'),
        );
      });
    });

    return this.updates;
  }

  override reset(): void {
    super.reset();
    this._chipInputAttrs = [];
    this._chipMaps = [];
  }

  private _handleChipListNode(node: compiler.TmplAstElement): void {
    this._chipMap = {
      chipList: node,
      chips: [],
    };

    this.updates.push(...this._buildUpdates(node, node, 'mat-chip-grid', 'mat-chip-listbox'));
  }

  private _handleChipNode(node: compiler.TmplAstElement): void {
    if (this._chipMap) {
      this._chipMap.chips.push(node);
      return;
    }

    this.updates.push(
      {
        location: node.startSourceSpan.start,
        updateFn: html => replaceStartTag(html, node, 'mat-chip-option'),
      },
      {
        location: node.startSourceSpan.start,
        updateFn: html => replaceEndTag(html, node, 'mat-chip-option'),
      },
    );
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
  private _buildUpdates(
    node: compiler.TmplAstElement,
    chipListNode: compiler.TmplAstElement,
    gridTag: string,
    listboxTag: string,
  ): Update[] {
    return [
      {
        location: node.startSourceSpan.start,
        updateFn: html => {
          return this._isChipGrid(chipListNode)
            ? replaceStartTag(html, node, gridTag)
            : replaceStartTag(html, node, listboxTag);
        },
      },
      {
        location: node.endSourceSpan!.start,
        updateFn: html => {
          return this._isChipGrid(chipListNode)
            ? replaceEndTag(html, node, gridTag)
            : replaceEndTag(html, node, listboxTag);
        },
      },
    ];
  }

  /** Stores the matChipInputFor references on given input. */
  private _storeChipRefs(node: compiler.TmplAstElement): void {
    for (let i = 0; i < node.inputs.length; i++) {
      if (node.inputs[i].name === 'matChipInputFor') {
        this._chipInputAttrs.push(node.inputs[i]);
        return;
      }
    }
  }

  /**
   * Returns whether the given node should be a mat-chip-grid or mat-chip-listbox.
   *
   * This is determined by whether the given mat-chip-list is referenced by any inputs. If it is,
   * then the node is a mat-chip-grid. Otherwise, it is a mat-chip-listbox.
   *
   * IMPORTANT: This function should only be used in an updateFn callback. This function assumes
   * the entire tree has already been traversed and all matChipInputFor attributes have been
   * found and stored.
   */
  private _isChipGrid(node: compiler.TmplAstElement): boolean {
    return node.references.some(ref => {
      return this._chipInputAttrs.some(attr => {
        const value = attr.value as compiler.ASTWithSource;
        return value.source === ref.name;
      });
    });
  }
}
