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
  TAB,
  UP_ARROW
} from '@angular/cdk/keycodes';
import {Directive, Optional} from '@angular/core';
import {Subject} from 'rxjs';
import {TreeControl} from './control/tree-control';


/**
 * Keyboard navigator interface.
 */
// TODO(tinayuangao): Move to a common place
export interface CdkNavigator<T> {
  insert(index: number, data: T, node: FocusableOption, parentData?: T);
  remove(index: number, parentData?: any);
  move(previousIndex: number, currentIndex: number, parentData?: T);
  updateFocusedData(newFocusedData: T);
}

/**
 * Navigator for CDK tree component. Use keyboard to navigate through the tree nodes.
 * `HOME` moves the focus to first node in the tree
 * `END` moves the focus to last node in the tree
 * `UP_ARROW`, and `DOWN_ARROW` moves the focus to previous/next visible node.
 * `LEFT_ARROW` moves the focus to parent node, or collapse current focused node.
 * `RIGHT_ARROW` moves the focus to first child node, or expand the current focused node.
 */
@Directive({
  selector: '[cdkTreeNavigator]',
  host: {
    '(keydown)': '_handleKeydown($event)',
    'class': 'cdk-tree-navigator',
  }
})
export class CdkTreeNavigator<T> implements CdkNavigator<T> {
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

  /**
   * Stream that emits any time the TAB key is pressed, so components can react
   * when focus is shifted off of the list.
   */
  tabOut: Subject<void> = new Subject<void>();

  constructor(@Optional() protected dir: Directionality) {}

  /** Add tree node to navigator's data */
  insert(index: number, data: T, node: FocusableOption, parentData?: T) {
    this.nodeMap.set(data, node);
    if (parentData) {
      this.parentMap.set(data, parentData);
    }
    this._getNodeList(parentData).splice(index, 0, data);
  }

  /** Remove a node data from navigator */
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

  /** Update node's index information */
  move(previousIndex: number, currentIndex: number, parentData?: T) {
    const nodeList = this._getNodeList(parentData);
    const target = nodeList.splice(previousIndex, 1);
    nodeList.splice(currentIndex, 0, target[0]);
  }

  /** When a tree node is focused, update the focused data in navigator */
  updateFocusedData(newFocusedData: T) {
    this.focusedData = newFocusedData;
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
      case TAB:
        this.tabOut.next();
        return;
    }
    event.preventDefault();
  }

  _changeFocusedData(newFocused: T | undefined) {
    if (newFocused) {
      this.focusedData = newFocused;
      if (this.nodeMap.has(this.focusedData)) {
        this.nodeMap.get(this.focusedData)!.focus();
      }
    }
  }

  _getFirst(): T | undefined {
    const nodeList = this._getNodeList();
    return nodeList[0];
  }

  _getLast(): T | undefined {
    const nodeList = this._getNodeList();
    return this._getLastChild(nodeList[nodeList.length - 1]);
  }

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

  _getNodeList(parentData?: T): T[] {
    if (!this.nodeListMap.has(parentData)) {
      this.nodeListMap.set(parentData, []);
    }
    return this.nodeListMap.get(parentData)!;
  }

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
