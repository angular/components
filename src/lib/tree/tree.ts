import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
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
import {SelectionModel} from '../core/selection/selection';
import {TreeModel} from './tree-model';


@Directive({selector: '[mdNodeContext]'})
export class MdNodeContext {
  constructor(public template: TemplateRef<MdNodeContext>) {}
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
  selector: 'md-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdTree implements OnInit, OnDestroy {

  @ContentChild(MdNodeContext) nodeContext: MdNodeContext;

  @Input() treeModel: TreeModel<any>;

  /**
   * The dataSource for the table rows. Not passing in a dataSource will
   * result in an MdTableInvalidDataSourceError exception.
   */

  @Output() onReload = new EventEmitter<void>();

  @Output() selectChange = new EventEmitter<any>();
  @Output() expandChange = new EventEmitter<any>()

  constructor(
    private _changeDetectorRef: ChangeDetectorRef) {}

  get templateRef() { return this.nodeContext.template; }

  ngOnInit() {
    this.treeModel.loadNodes();
  }

  ngOnDestroy() {
  }

  select(data: any) {
    this.treeModel.select(data);
  }

  expand(data: any) {
    this.treeModel.expand(data);
  }
}