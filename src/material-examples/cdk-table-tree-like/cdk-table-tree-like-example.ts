import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Directive,
  SkipSelf,
  InjectionToken,
  ElementRef,
  OnDestroy,
  Inject,
  Self,
  Renderer2
} from '@angular/core';
import {Observable, of as observableOf} from 'rxjs';
import {FlatTreeControl,
  CdkTreeNode,
  CdkTree,
  TreeControl,
  CdkTreeNodeToggle} from '@angular/cdk/tree';
import {MatTreeFlattener, MatTreeFlatDataSource} from '@angular/material/tree';
import {
  CDK_ROW_TEMPLATE,
  CdkRow,
  CDK_TABLE_TEMPLATE,
  CdkTable,
  CdkCell,
  CdkColumnDef,
} from '@angular/cdk/table';

/** Injection token used to get the instance of the custom row instance  */
export const CUSTOM_ROW_RESOLVER = new InjectionToken<Function>('custom-row-resolver');

export function CUSTOM_ROW_RESOLVER_PROVIDER_FACTORY(c: CustomCell<any>): Function {
  const resolver = () => c._row as CustomRow<any>;
  return resolver;
}

/**
 * File node data with nested structure.
 * Each node has a filename, and a type or a list of children.
 */
export class FileNode {
  children: FileNode[];
  filename: string;
  type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
  constructor(
    public expandable: boolean, public filename: string, public level: number, public type: any) {}
}

/**
 * The file structure tree data in string. The data could be parsed into a Json object
 */
const TABLE_DATA: FileNode[] = [
  {
    filename: 'Applications',
    type: 'dir',
    children: [
      {
        filename: 'Calendar',
        type: 'app',
        children: [],
      },
      {
        filename: 'Chrome',
        type: 'app',
        children: [],
      },
      {
        filename: 'Webstorm',
        type: 'app',
        children: [],
      }
    ],
  },
  {
    filename: 'Downloads',
    type: 'dir',
    children: [
      {
        filename: 'October',
        type: 'pdf',
        children: [],
      },
      {
        filename: 'Nobember',
        type: 'pdf',
        children: [],
      },
      {
        filename: 'Tutorial',
        type: 'html',
        children: [],
      },
    ],
  },
];

/**
 * @title Tree like cdk data-table
 */
@Component({
  selector: 'cdk-table-tree-like-example',
  styleUrls: ['cdk-table-tree-like-example.css'],
  templateUrl: 'cdk-table-tree-like-example.html',
})
export class CdkTableTreeLikeExample {
  treeControl: FlatTreeControl<FileFlatNode>;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode>;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode>;

  constructor() {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
    this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FileFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.dataSource.data = TABLE_DATA;
  }

  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(node.children.length > 0, node.filename, level, node.type);
  }

  private _getLevel = (node: FileFlatNode) => node.level;

  private _isExpandable = (node: FileFlatNode) => node.expandable;

  private _getChildren = (node: FileNode): Observable<FileNode[]> => observableOf(node.children);
}


/** Data row template container that contains the cell outlet. Adds the right class and role. */
@Component({
  selector: 'custom-row, tr[custom-row]',
  template: CDK_ROW_TEMPLATE,
  host: {
    'class': 'custom-row',
    'role': 'row',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'customRow',
  providers: [
    {provide: CdkRow, useExisting: CustomRow},
    {provide: CdkTreeNode, useExisting: CustomRow}
  ],
})
export class CustomRow<T> extends CdkRow<T> implements OnDestroy {
  /**
   * @internal
   * Necessary due to the fact that we cannot get the DtRow via normal DI
   */
  static mostRecentRow: CustomRow<any> | null = null;

  constructor() {
    super();
    CustomRow.mostRecentRow = this;
  }

  ngOnDestroy(): void {
    if (CustomRow.mostRecentRow === this) {
      CustomRow.mostRecentRow = null;
    }
  }
}

/**
 * Wrapper for the CdkTable.
 */
@Component({
  selector: 'custom-table, table[custom-table]',
  exportAs: 'customTable',
  template: CDK_TABLE_TEMPLATE,
  host: {
    'class': 'custom-table',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CdkTree, useExisting: CustomTable }]
})
export class CustomTable<T> extends CdkTable<T> {
  @Input() treeControl: TreeControl<T>;
}

/**
 * Custom cell
 */
@Directive({
  selector: 'custom-cell, td[custom-cell]',
  exportAs: 'customCell',
  host: {
    'class': 'custom-cell',
    'style.vertical-align': 'middle',
  },
  providers: [
    {
      provide: CUSTOM_ROW_RESOLVER,
      useFactory: CUSTOM_ROW_RESOLVER_PROVIDER_FACTORY,
      deps: [[new Self(), CustomCell]],
    },
  ],
})
export class CustomCell<T> extends CdkCell {
  /**
   * @internal
   * The parent row
   */
  _row: CustomRow<any>;

  private _level: number;

  private _indent = 20;

  constructor(
    columnDef: CdkColumnDef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    @SkipSelf() private _tree: CdkTree<T>
  ) {
    super(columnDef, _elementRef);
    if (CustomRow.mostRecentRow) {
      this._row = CustomRow.mostRecentRow;
    }
    Promise.resolve().then(() => this._setPadding());
  }

  private _paddingIndent(): string | null {
    const treeControl = this._tree.treeControl as TreeControl<T>;
    const row = this._row as CustomRow<T>;
    const nodeLevel = (row.data && treeControl.getLevel)
      ? treeControl.getLevel(row.data)
      : null;
    const level = this._level || nodeLevel;
    return level ? `${level * this._indent}px` : null;
  }

  private _setPadding(): void {
    const padding = this._paddingIndent();
    this._renderer.setStyle(this._elementRef.nativeElement, 'paddingLeft', padding);
  }
}

/**
 * Node toggle to expand/collapse the node.
 */
@Directive({
  selector: '[customTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  }
})
export class CustomTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
  constructor(
    _tree: CdkTree<T>,
    @Inject(CUSTOM_ROW_RESOLVER) @SkipSelf() _rowResolver: Function) {
    super(_tree, _rowResolver() as unknown as CdkTreeNode<T>);
  }
}
