import {CdkTreeModule} from '@angular/cdk/tree';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {Component} from '@angular/core';

/** A node in the tree. */
interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

/**
 * @title Tree with virtual scrolling
 */
@Component({
  selector: 'cdk-tree-virtual-scroll-example',
  templateUrl: 'cdk-tree-virtual-scroll-example.html',
  styleUrl: 'cdk-tree-virtual-scroll-example.css',
  imports: [CdkTreeModule, ScrollingModule],
})
export class CdkTreeVirtualScrollExample {
  /** Height of every row. Virtual scrolling requires a uniform row height. */
  readonly itemSize = 48;

  /**
   * The tree flattens the data itself, taking expansion into account. The
   * `cdk-virtual-scroll-viewport` then only renders the nodes that are visible.
   */
  readonly dataSource = EXAMPLE_DATA;

  readonly childrenAccessor = (node: TreeNode) => node.children ?? [];

  readonly expansionKey = (node: TreeNode) => node.id;

  readonly trackBy = (_: number, node: TreeNode) => node.id;

  isExpandable(node: TreeNode): boolean {
    return !!node.children?.length;
  }
}

/** Builds a large, three-level tree so that virtual scrolling actually matters. */
function buildData(): TreeNode[] {
  return Array.from({length: 1000}, (_, i) => {
    const root = i + 1;

    return {
      id: `node-${root}`,
      name: `Node ${root}`,
      children: Array.from({length: 5}, (_, j) => {
        const child = j + 1;

        return {
          id: `node-${root}-${child}`,
          name: `Node ${root}.${child}`,
          children: Array.from({length: 3}, (_, k) => {
            const grandchild = k + 1;

            return {
              id: `node-${root}-${child}-${grandchild}`,
              name: `Node ${root}.${child}.${grandchild}`,
            };
          }),
        };
      }),
    };
  });
}

const EXAMPLE_DATA: TreeNode[] = buildData();
