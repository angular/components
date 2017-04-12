import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {MdTreeDataSource} from './data-source';

/**
 * Passed in values to the MdRowContextWhenFunction. These properties are
 * copied from the ngFor loop, which allow you access to loop variables when
 * determining to render a row template.
 */
export interface NgForContext {
  index: number;
  first: boolean;
  last: boolean;
}

/**
 * The context directive for the `md-row` element. This template is stamped out
 * for the number of rows in the table.
 *
 * To customize the rows that are rendered, `MdRowContext` supports a
 * `when` option. This option tells the table when to render a row. If
 * multiple rowContexts match a given row, only the first will be rendered.
 */
@Directive({selector: '[mdNodeContext]'})
export class MdNodeContext {
  @ContentChildren(MdTreeNode) cells: QueryList<MdTreeNode>;

  constructor(public template: TemplateRef<MdNodeContext>) {}
}

@Directive({
  selector: 'md-tree-node',
  host: {
    '[class.mat-tree-node]': 'true',
  },
})
export class MdTreeNode {

}

/**
 * A material design table component. In order to use the md-data-table, a
 * dataSource must be provided which implements the MdTableDataSource. The
 * table should contain md-row, mdRowContext, and md-cell directives.
 *
 * Example Use:
 * <md-data-table [dataSource]="dataSource">
 *   <md-header-row>
 *     <md-header-cell>Name</md-header-cell>
 *     <md-header-cell>Email</md-header-cell>
 *   <md-header-row>
 *   <md-row *mdRowContext="let row = row; when: mySuperCoolWhenFn">
 *     <md-cell>{{row.name}}</md-cell>
 *     <md-cell>{{row.email}}</md-cell>
 *   </md-row>
 * </md-data-table>
 * <md-tree [dataSource]="dataSource">
 *   <md-tree-parent>
 *   <md-tree-node *mdNodeContext="let node  = node">
 *     {{node.name}}
 *   </md-tree-node>
 * </md-tre>
 */
@Component({
  moduleId: module.id,
  selector: 'md-data-table',
  templateUrl: 'data-table.html',
  host: {
    '[class.mat-table]': 'true',
    'role': 'grid',
  },
  styleUrls: ['data-table.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdTree implements OnInit, OnDestroy {
  /**
   * The dataSource for the table rows. Not passing in a dataSource will
   * result in an MdTableInvalidDataSourceError exception.
   */
  @Input() dataSource: MdTreeDataSource<any>;

  @ContentChildren(MdNodeContext) nodeContexts: QueryList<MdNodeContext>;

  @Output() onReload = new EventEmitter<void>();

  nodes: any[];
  nodeCount: number;
  nodeSubscription: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {

    this.nodeSubscription = this.dataSource.getNodes().subscribe(result => {
      this.nodes = result.nodes;
      this.nodeCount = result.nodeCount;
      this._changeDetectorRef.markForCheck();
      this.onReload.emit();
    });
  }

  ngOnDestroy() {
    this.nodeSubscription.unsubscribe();
  }

  /**
   * Returns true if the row is the last one.
   */
  isLast(index: number): boolean {
    return index === this.nodeCount - 1;
  }

  /**
   * Returns the first template that matches the row.
   */
  getTemplateForNode(
    node: any, index: number, first: boolean): TemplateRef<MdNodeContext> {
    const ngForContext: NgForContext = {
      index,
      first,
      last: this.isLast(index),
    };

    return this.nodeContexts[0].template;
  }
}

