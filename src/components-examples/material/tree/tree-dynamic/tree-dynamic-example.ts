import {ChangeDetectionStrategy, Component, Injectable, inject, signal} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTreeModule} from '@angular/material/tree';

/** Node with expandable and level information */
interface DynamicNode {
  name: string;
  level: number;
  expandable: boolean;
  isLoading: ReturnType<typeof signal<boolean>>;
  children?: DynamicNode[];
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({providedIn: 'root'})
export class DynamicDatabase {
  dataMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    ['Apple', ['Fuji', 'Macintosh']],
    ['Onion', ['Yellow', 'White', 'Purple']],
  ]);

  rootLevelNodes: string[] = ['Fruits', 'Vegetables'];

  /** Initial data from database */
  initialData(): DynamicNode[] {
    return this.rootLevelNodes.map(name => this.createNode(name, 0, true));
  }

  createNode(name: string, level: number, expandable: boolean): DynamicNode {
    return {
      name,
      level,
      expandable,
      isLoading: signal(false),
      children: undefined,
    };
  }

  getChildren(name: string): string[] | undefined {
    return this.dataMap.get(name);
  }

  isExpandable(name: string): boolean {
    return this.dataMap.has(name);
  }
}

/**
 * @title Tree with dynamic data
 */
@Component({
  selector: 'tree-dynamic-example',
  templateUrl: 'tree-dynamic-example.html',
  styleUrl: 'tree-dynamic-example.css',
  imports: [MatTreeModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeDynamicExample {
  private _database = inject(DynamicDatabase);

  dataSource = this._database.initialData();

  childrenAccessor = (node: DynamicNode) => node.children ?? [];

  hasChild = (_: number, node: DynamicNode) => node.expandable;

  /**
   * Load children on node expansion.
   * Called from template via (expandedChange) output.
   */
  onNodeExpanded(node: DynamicNode, expanded: boolean): void {
    if (!expanded || node.children) {
      // Don't reload if collapsing or already loaded
      return;
    }

    const childNames = this._database.getChildren(node.name);
    if (!childNames) {
      return;
    }

    node.isLoading.set(true);

    // Simulate async data loading
    setTimeout(() => {
      node.children = childNames.map(name =>
        this._database.createNode(name, node.level + 1, this._database.isExpandable(name)),
      );
      node.isLoading.set(false);
    }, 1000);
  }
}
