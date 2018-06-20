/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FocusableOption} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  NUMPAD_MULTIPLY,
  RIGHT_ARROW,
  UP_ARROW
} from '@angular/cdk/keycodes';
import {Directive, Optional} from '@angular/core';
import {TreeControl} from './control/tree-control';

/**
 * Directive that adds keyboard interaction to a CdkTree component instance.
 * This directive maintains a list of data/nodes, updated either when nodes are
 * inserted/moved/removed or the node outlet of parent tree node in the nested tree.
 * Focus of the tree node is moved based on keyboard interaction. It moves the focus to
 * correct position or expand/collapse nodes.
 *   `HOME` moves the focus to first node in the tree
 *   `END` moves the focus to last node in the tree
 *   `UP_ARROW`, and `DOWN_ARROW` moves the focus to previous/next visible node.
 *   `LEFT_ARROW` moves the focus to parent node, or collapse current focused node.
 *   `RIGHT_ARROW` moves the focus to first child node, or expand the current focused node.
 *   `*` in numer pad expands all nodes
 * @docs-private
 */
@Directive({
  selector: '[cdkTreeKeyboardInteraction]',
  host: {
    '(keydown)': '_handleKeydown($event)',
    'class': 'cdk-tree-keyboard-interaction',
  },
})
export class CdkTreeKeyboardInteraction<T> {
  /** The node map map data nodes to CdkTreeNodes */
  protected nodeMap: Map<T, FocusableOption> = new Map<T, FocusableOption>();

  /** A map from parent node to a list of children. */
  protected nodeListMap: Map<T | undefined, T[]> = new Map<T | undefined, T[]>();

  /** A map from node data to its parent node data. */
  protected parentMap: Map<T, T> = new Map<T, T>();

  /** Current focused node data. */
  focusedData: T;

  /** Tree control is used to expand or collapse nodes. */
  treeControl: TreeControl<T>;

  constructor(@Optional() protected dir: Directionality) {}

  /** Add tree node to data list based on owner of parent view container. */
  insert(index: number, data: T, node: FocusableOption, parentData?: T) {
    this.nodeMap.set(data, node);
    if (parentData) {
      this.parentMap.set(data, parentData);
    }
    this._getNodeList(parentData).splice(index, 0, data);
  }

  /** Remove a node data from node list based on the owner of view container. */
  remove(index: number, parentData?: T) {
    const nodeList = this._getNodeList(parentData);
    const removed = nodeList.splice(index, 1)[0];
    if (removed && removed === this.focusedData) {
      this._changeFocusedData(this._getNext());
    }
    this.nodeMap.delete(removed);
    this.parentMap.delete(removed);
    this.nodeListMap.delete(removed);
  }

  /** Update node's index information based on the owner of view container. */
  move(previousIndex: number, currentIndex: number, parentData?: T) {
    const nodeList = this._getNodeList(parentData);
    const target = nodeList.splice(previousIndex, 1);
    nodeList.splice(currentIndex, 0, target[0]);
  }

  /** When a tree node is focused, update the current focused data. */
  updateFocusedData(newFocusedData: T) {
    this.focusedData = newFocusedData;
  }

  /** Focus first node when the tree is focused */
  focus() {
    this.focusedData ? this._changeFocusedData(this.focusedData) : this.focusFirst();
  }

  /** Change focus to first visible node in the tree. */
  focusFirst() {
    this._changeFocusedData(this._getFirst());
  }

  /** Change focus to last visible node in the tree. */
  focusLast() {
    this._changeFocusedData(this._getLast());
  }

  /** Change focus to previous visible node. */
  focusPreviousVisibleNode() {
    if (!this.focusedData) {
      return this.focusLast();
    }
    this._changeFocusedData(this._getPrevious());
  }

  /** Change focus to next visible node. */
  focusNextVisibleNode() {
    if (!this.focusedData) {
      return this.focusFirst();
    }
    this._changeFocusedData(this._getNext());
  }

  /** Collapse the current node if it's expanded. Otherwise move to parent. */
  collapseCurrentFocusedNode() {
    if (this.focusedData && this.treeControl) {
      if (this.treeControl.isExpanded(this.focusedData)) {
        this.treeControl.collapse(this.focusedData);
      } else {
        this._changeFocusedData(this._getParent());
      }
    }
  }

  /** Expand the current node if it's not expanded. Otherwise move to its first child. */
  expandCurrentFocusedNode() {
    if (this.focusedData && this.treeControl) {
      if (!this.treeControl.isExpanded(this.focusedData)) {
        this.treeControl.expand(this.focusedData);
      } else {
        this._changeFocusedData(this._getNext());
      }
    }
  }

  /** Expand all the nodes in the tree */
  expandAll() {
    if (this.treeControl) {
      this.treeControl.expandAll();
    }
  }

  /** Expand the current node if it's not expanded. Otherwise move to its first child. */
  toggleCurrentFocusedNode() {
    if (this.focusedData && this.treeControl) {
      this.treeControl.toggle(this.focusedData);
    }
  }

  _isRtl() {
    return this.dir && this.dir.value === 'rtl';
  }

  /**
   * Pass events to the keyboard manager. Available here for tests.
   */
  _handleKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case HOME:
        this.focusFirst();
        break;
      case END:
        this.focusLast();
        break;
      case ENTER:
        this.toggleCurrentFocusedNode();
        break;
      case UP_ARROW:
        this.focusPreviousVisibleNode();
        break;
      case DOWN_ARROW:
        this.focusNextVisibleNode();
        break;
      case LEFT_ARROW:
        this._isRtl() ? this.expandCurrentFocusedNode() : this.collapseCurrentFocusedNode();
        break;
      case RIGHT_ARROW:
        this._isRtl() ? this.collapseCurrentFocusedNode() : this.expandCurrentFocusedNode();
        break;
      case NUMPAD_MULTIPLY:
        this.expandAll();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  /** Focus the tree node component with new focused data. */
  _changeFocusedData(newFocused: T | undefined) {
    if (newFocused) {
      this.focusedData = newFocused;
      if (this.nodeMap.has(this.focusedData)) {
        this.nodeMap.get(this.focusedData)!.focus();
      }
    }
  }

  /** Returns the data of the first visible tree node in the tree. */
  _getFirst(): T | undefined {
    const nodeList = this._getNodeList();
    return nodeList[0];
  }

  /** Returns the data of the last visible tree node in the tree. */
  _getLast(): T | undefined {
    const nodeList = this._getNodeList();
    return this._getLastChild(nodeList[nodeList.length - 1]);
  }

  /** Returns the previous visible tree node of current focused data. */
  _getPrevious(): T | undefined {
    if (!this.focusedData) {
      return;
    }
    const parent = this.parentMap.get(this.focusedData);
    const nodeList = this.nodeListMap.get(parent);
    const index = nodeList!.indexOf(this.focusedData);
    if (index === 0) {
      return parent;
    } else if (index > 0) {
      return this._getLastChild(nodeList![index - 1]);
    }
  }

  /** Returns the next visible tree node data of current focused data. */
  _getNext(): T | undefined {
    if (!this.focusedData) {
      return;
    }
    // Always return first child if the node is expanded
    if (this.nodeListMap.has(this.focusedData) &&
        this.treeControl && this.treeControl.isExpanded(this.focusedData)) {
      const childNodeList = this._getNodeList(this.focusedData);
      if (childNodeList.length) {
        return childNodeList[0];
      }
    }
    // Or return next sibling / parent's next child if any
    let currentData: T | undefined = this.focusedData;
    while (currentData) {
      const parent = this.parentMap.get(currentData);
      const nodeList = this.nodeListMap.get(parent);
      const index = nodeList!.indexOf(currentData);
      if (index === nodeList!.length - 1) {
        currentData = parent;
      } else if (index > -1) {
        return nodeList![index + 1];
      }
    }
    return undefined;
  }

  /** Returns the parent of current focused node. */
  _getParent(): T | undefined {
    if (this.parentMap.has(this.focusedData)) {
      // For nested tree
      this._changeFocusedData(this.parentMap.get(this.focusedData));
    } else if (this.treeControl.getLevel) {
      // For flat tree
      const nodeList = this._getNodeList();
      const index = nodeList.indexOf(this.focusedData);
      const level = this.treeControl.getLevel(this.focusedData) - 1;
      if (index <= 0) {
        return;
      }
      for (let i = index - 1; i >= 0; i--) {
        if (this.treeControl.getLevel(nodeList[i]) === level) {
          return nodeList[i];
        }
      }
    }
  }

  /**
   * Returns the data of list of children in the current `parentData` node's view container.
   * If there's no parent, return the tree nodes in the tree's view container.
   */
  _getNodeList(parentData?: T): T[] {
    if (!this.nodeListMap.has(parentData)) {
      this.nodeListMap.set(parentData, []);
    }
    return this.nodeListMap.get(parentData)!;
  }

  /**
   * Returns the data of last visible elements in the sub-tree rooted at `targetNode`.
   */
  _getLastChild(targetNode: T) {
    let currentData = targetNode;
    while (currentData && this.nodeListMap.has(currentData) &&
        this.treeControl && this.treeControl.isExpanded(currentData)) {
      const childNodeList = this._getNodeList(currentData);
      if (childNodeList.length) {
        currentData = childNodeList[childNodeList.length - 1];
      } else {
        break;
      }
    }
    return currentData;
  }
}
