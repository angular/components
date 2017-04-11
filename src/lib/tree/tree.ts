import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {PortalModule, Portal, PortalHostDirective, ComponentPortal} from '../core';
import {MdTreeNode} from './tree-node';
import {TreeModel} from './tree-model';
import {TreeNodeModel} from './tree-node-model';

export class MdTreeChange {
  key: string;
  value: boolean;
}

@Component({
  selector: 'md-tree',
  host: {
  },
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],

})
export class MdTree implements AfterContentInit {
  @ContentChildren(MdTreeNode) treeNodes: QueryList<MdTreeNode>;

  @ViewChild(PortalHostDirective) portalHost: ComponentPortal<MdTreeNode>;

  @Input()
  nodeTemplate: Portal<any>;

  /**  The keys of the nodes which are expanded. */
  _expandedKeys: string[] = [];

  /** The keys of the nodes which are selected. */
  _selectedKeys: string[] = [];

  @Input()
  get expandedKeys() {
    return this._expandedKeys;
  }
  set expandedKeys(keys: string[]) {
    console.log(`expanded keys ${keys}`);
    this._expandedKeys = keys;
  }

  @Input()
  get selectedKeys() {
    return this._selectedKeys;
  }
  set selectedKeys(keys: string[]) {
    this._selectedKeys = keys;
  }

  @Input()
  selectChildren: boolean = false;

  @Input()
  disabled: boolean;

  @Input()
  loadData: (node: MdTreeNode) => {};

  _nodes: TreeModel;
  @Input()
  get nodes(): TreeModel {
    return this._nodes;
  }
  set nodes(value: TreeModel) {
    this._nodes = value;

    // build the tree
    let root = value.root;
    root.children.forEach((node) => {
      // Add node;
      this._addNode(node);

    });
  }

  _addNode(node: TreeNodeModel) {
    // add children
    node.children.forEach(this._addNode);

    this.portalHost = new ComponentPortal(MdTreeNode);
 //   let mdNode = this.portalHost.component.

    // add node itself


  }

  @Output()
  selectChange: EventEmitter<MdTreeChange> = new EventEmitter<MdTreeChange>();

  @Output()
  expandChange: EventEmitter<MdTreeChange> = new EventEmitter<MdTreeChange>();

  updateSelected(key: string, selected: boolean) {
    let index = this._selectedKeys.indexOf(key);
    if (index == -1 && selected) {
      this._selectedKeys.push(key);
      this._emitTreeChange(key, 'select', true);
    } else if (index > -1 && !selected) {
      this._selectedKeys.splice(index, 1);
      this._emitTreeChange(key, 'select', false);
    }
  }

  updateExpanded(key: string, expanded: boolean) {
    let index = this._expandedKeys.indexOf(key);
    if (index == -1 && expanded) {
      this._expandedKeys.push(key);
      this._emitTreeChange(key, 'expand', true);
    } else if (index > -1 && !expanded) {
      this._expandedKeys.splice(index, 1);
      this._emitTreeChange(key, 'expand', false);
    }
  }

  _emitTreeChange(key: string, type: 'select' | 'expand', value: boolean) {
    let change = new MdTreeChange();
    change.key = key;
    change.value = value;
    if (type == 'select') {
      this.selectChange.emit(change);
    } else {
      this.expandChange.emit(change);
    }
    console.log(`emit tree change ${key} ${type} ${value}`);
  }

  root: {};
  ngAfterContentInit() {
  }

  findKey(key: string): MdTreeNode {
    let result: MdTreeNode = null;
    this.treeNodes.forEach(node => {
      let found = node.findKey(key);
      if (found) {
        result = found;
      }
    });
    return result;
  }
}




@NgModule({
  imports: [BrowserModule, PortalModule],
  exports: [MdTreeNode, MdTree],
  declarations: [MdTreeNode, MdTree],
})
export class MdTreeModule {}

// import {
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
//   Component,
//   ContentChildren,
//   Directive,
//   EventEmitter,
//   Input,
//   OnDestroy,
//   OnInit,
//   Output,
//   QueryList,
//   TemplateRef,
//   ViewEncapsulation
// } from '@angular/core';
// import {Subscription} from 'rxjs/Subscription';
// import {MdTreeDataSource} from './data-source';
//
// /**
//  * Type for the mdRowContextWhen method. Takes in the current row in the ngFor
//  * loop as well as the collection of ngFor properties. Returns whether to show
//  * the given row.
//  */
// export interface MdRowContextWhenFunction {
//   (row?: any, ngForContext?: NgForContext): boolean;
// }
//
// /**
//  * Passed in values to the MdRowContextWhenFunction. These properties are
//  * copied from the ngFor loop, which allow you access to loop variables when
//  * determining to render a row template.
//  */
// export interface NgForContext {
//   index: number;
//   first: boolean;
//   last: boolean;
//   even: boolean;
//   odd: boolean;
// }
//
// /**
//  * A header cell in the md-data-table. Custom classes can be added to the
//  * md-header-cell element to style the cell.
//  */
// @Directive({
//   selector: 'md-header-cell',
//   host: {
//     '[class.mat-table-header-cell]': 'true',
//     'role': 'columnheader',
//     '(click)': 'updateSortColumn($event)',
//     '[class.mat-table-sortable]': 'sortKey',
//     '[class.mat-table-sort-descending]': 'isDescending',
//     '[class.mat-table-sort-ascending]': 'isAscending',
//   },
// })
// export class MdHeaderCell implements OnInit, OnDestroy {
//   isDescending: boolean;
//   isAscending: boolean;
//
//   sortSubscription: Subscription;
//
//   @Input() sortKey: string|undefined;
//
//   constructor(private _sortService: MdTableSortService) {}
//
//   ngOnInit() {
//     this.sortSubscription =
//       this._sortService.getSortData().subscribe(sortData => {
//         const isActive = sortData.sortColumn === this.sortKey;
//         this.isDescending = isActive && (sortData.sortOrder === 'descending');
//         this.isAscending = isActive && (sortData.sortOrder === 'ascending');
//       });
//   }
//
//   ngOnDestroy() {
//     this.sortSubscription.unsubscribe();
//   }
//
//   updateSortColumn(event: Event) {
//     if (this.sortKey) {
//       this._sortService.sortColumn = this.sortKey;
//     }
//   }
// }
//
//
// /**
//  * The context directive for the `md-row` element. This template is stamped out
//  * for the number of rows in the table.
//  *
//  * To customize the rows that are rendered, `MdRowContext` supports a
//  * `when` option. This option tells the table when to render a row. If
//  * multiple rowContexts match a given row, only the first will be rendered.
//  */
// @Directive({selector: '[mdRowContext]'})
// export class MdRowContext {
//   @ContentChildren(MdCell) cells: QueryList<MdCell>;
//
//   private _when: MdRowContextWhenFunction;
//
//   @Input()
//   set mdRowContextWhen(value: MdRowContextWhenFunction) {
//     this._when = value;
//   }
//
//   get mdRowContextWhen(): MdRowContextWhenFunction {
//     return this._when;
//   }
//
//   constructor(public template: TemplateRef<MdRowContext>) {}
// }
//
//
// /**
//  * A material design table component. In order to use the md-data-table, a
//  * dataSource must be provided which implements the MdTableDataSource. The
//  * table should contain md-row, mdRowContext, and md-cell directives.
//  *
//  * Example Use:
//  * <md-data-table [dataSource]="dataSource">
//  *   <md-header-row>
//  *     <md-header-cell>Name</md-header-cell>
//  *     <md-header-cell>Email</md-header-cell>
//  *   <md-header-row>
//  *   <md-row *mdRowContext="let row = row; when: mySuperCoolWhenFn">
//  *     <md-cell>{{row.name}}</md-cell>
//  *     <md-cell>{{row.email}}</md-cell>
//  *   </md-row>
//  * </md-data-table>
//  * <md-tree [dataSource]="dataSource">
//  *   <md-tree-parent>
//  *   <md-tree-node *mdNodeContext="let node  = node">
//  *     {{node.name}}
//  *   </md-tree-node>
//  * </md-tre>
//  */
// @Component({
//   moduleId: module.id,
//   selector: 'md-data-table',
//   templateUrl: 'data-table.html',
//   host: {
//     '[class.mat-table]': 'true',
//     'role': 'grid',
//   },
//   styleUrls: ['data-table.css'],
//   encapsulation: ViewEncapsulation.None,
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   providers: [MdTableSortService],
// })
// export class MdDataTable implements OnInit, OnDestroy {
//   /**
//    * The dataSource for the table rows. Not passing in a dataSource will
//    * result in an MdTableInvalidDataSourceError exception.
//    */
//   @Input() dataSource: MdTreeDataSource<any>;
//
//   /**
//    * The sort order of the first click on a header. If no default is provided,
//    * the table will sort in ascending order.
//    */
//   @Input()
//   set defaultSortOrder(sortOrder: MdTableSortOrder) {
//     this._sortService.defaultSortOrder = sortOrder;
//   }
//   get defaultSortOrder(): MdTableSortOrder { return this._sortService.defaultSortOrder; }
//
//   /**
//    * The initial column to sort the table by. If no column is set, the table
//    * will be initialized without sorting.
//    */
//   @Input()
//   set initialSortColumn(sortColumn: string) { this._sortService.initialSortColumn = sortColumn; }
//   get initialSortColumn(): string { return this._sortService.initialSortColumn; }
//
//   @ContentChildren(MdRowContext) rowContexts: QueryList<MdRowContext>;
//
//   @Output() onReload = new EventEmitter<void>();
//   @Output() onSort = new EventEmitter<MdTableSortData>();
//
//   rows: any[];
//   rowCount: number;
//   rowSubscription: Subscription;
//   sortSubscription: Subscription;
//
//   constructor(
//     private _changeDetectorRef: ChangeDetectorRef,
//     private _sortService: MdTableSortService) {}
//
//   ngOnInit() {
//     if (!this.dataSource) {
//       throw new MdTableInvalidDataSourceError();
//     }
//
//     this.rowSubscription = this.dataSource.getRows().subscribe(result => {
//       this.rows = result.rows;
//       this.rowCount = result.rowCount;
//       this._changeDetectorRef.markForCheck();
//       this.onReload.emit();
//     });
//
//     this.sortSubscription =
//       this._sortService.getSortData().subscribe(sortData => {
//         this.onSort.emit(sortData);
//       });
//   }
//
//   ngOnDestroy() {
//     this.rowSubscription.unsubscribe();
//     this.sortSubscription.unsubscribe();
//   }
//
//   /**
//    * Returns true if the row is the last one.
//    */
//   isLast(index: number): boolean {
//     return index === this.rowCount - 1;
//   }
//
//   /**
//    * Returns the first template that matches the row.
//    */
//   getTemplateForNode(
//     row: any, index: number, first: boolean): TemplateRef<MdRowContext> {
//     const ngForContext: NgForContext = {
//       index,
//       first,
//       last: this.isLast(index),
//     };
//
//     return this.rowContexts
//       .find(rowContext => {
//         const whenFunction = rowContext.mdRowContextWhen;
//         return whenFunction ? whenFunction(row, ngForContext) : true;
//       })
//       .template;
//   }
// }
