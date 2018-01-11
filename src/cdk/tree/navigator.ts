/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, HOME, END} from '@angular/cdk/keycodes';
import {Directive} from '@angular/core';
import {CdkTreeNode, CdkTree} from './tree';


/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * dataNodes with hierarchy. Updates the dataNodes when new data is provided by the data source.
 */
@Directive({
  selector: '[cdkTreeNavigator]',
  host: {
    '(keydown)': '_handleKeydown($event)'
  }
})
export class CdkTreeNavigator<T> {
  focusedData: T;

  constructor(protected _tree: CdkTree<T>) {}

  /** Change focus to first visible node in the tree. */
  focusFirst() {
    this._changeFocusedData(this._tree.treeControl.getFirstNode());
  }

  /** Change focus to last visible node in the tree. */
  focusLast() {
    this._changeFocusedData(this._tree.treeControl.getLastNode());
  }

  /** Change focus to previous visible node. */
  focusPreviousVisibleNode() {
    if (!this.focusedData) {
      this.focusLast();
    }
    this._changeFocusedData(this._tree.treeControl.getPrevious(this.focusedData));
  }

  /** Change focus to next visible node */
  focusNextVisibleNode() {
    if (!this.focusedData) {
      this.focusFirst();
    }
    this._changeFocusedData(this._tree.treeControl.getNext(this.focusedData));
  }

  /** Collapse the current node if it's expanded. Otherwise move to parent. */
  collapseCurrentFocusedNode() {
    if (this.focusedData) {
      if (this._tree.treeControl.isExpanded(this.focusedData)) {
        this._tree.treeControl.collapse(this.focusedData);
      } else {
        this._changeFocusedData(this._tree.treeControl.getParent(this.focusedData));
      }
    }
  }

  expandCurrentFocusedNode() {
    if (this.focusedData) {
        if (!this._tree.treeControl.isExpanded(this.focusedData)) {
          this._tree.treeControl.expand(this.focusedData);
        } else {
          this._changeFocusedData(this._tree.treeControl.getFirstChild(this.focusedData));
        }
    }
  }

  _changeFocusedData(newFocused: T | undefined) {
    if (newFocused) {
      this.focusedData = newFocused;
      this._tree.nodeMap.get(this.focusedData)!.focus();
    }
  }

  /**
   * Pass events to the keyboard manager. Available here for tests.
   */
  _handleKeydown(event: KeyboardEvent) {
    let code = event.keyCode;

    let isLeftKey = (code === LEFT_ARROW);
    let isRightKey = (code === RIGHT_ARROW);
    let isHomeKey = code === HOME;
    let isEndKey = code === END;
    let isUpKey = (code === UP_ARROW);
    let isDownKey = (code === DOWN_ARROW);

    // Focus first/last item
    if (isEndKey) {
      this.focusLast();
    } else if (isHomeKey) {
      this.focusFirst();
    }

    if (isUpKey) {
      this.focusPreviousVisibleNode();
    } else if (isDownKey) {
      this.focusNextVisibleNode();
    } else if (isLeftKey) {
      this.collapseCurrentFocusedNode();
    } else if (isRightKey) {
      this.expandCurrentFocusedNode();
    }
    event.preventDefault();
  }

  updateFocusedNode(node: CdkTreeNode<T>) {
    if (this.focusedData !== node.data) {
      this.focusedData = node.data;
    }
  }
}
