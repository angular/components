import {SelectionModel} from '../core';

export class TreeControl<T extends Object> {

  flatNodes: T[];

  /** Level info */
  levelMap: WeakMap<T, number>;

  /** Parent info */
  parentMap: WeakMap<T, T>;

  /** Index info (for flatten version) */
  indexMap: WeakMap<T, number>;

  /** Parent bit information: to draw dotted lines of tree structure */
  parentBitLevels: WeakMap<T, number[]>;

  /** Expansion info: the model */
  expansionModel: SelectionModel<T> = new SelectionModel<T>();

  getLevel(node: T) {
    return this.levelMap.get(node);
  }

  getParent(node: T) {
    return this.parentMap.get(node);
  }

  getIndex(node: T) {
    return this.indexMap.get(node);
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    this.flatNodes = [];
    this.levelMap = new WeakMap<T, number>();
    this.parentMap = new WeakMap<T, T>();
    this.indexMap = new WeakMap<T, number>();
    this.parentBitLevels = new WeakMap<T, number[]>();
  }
}