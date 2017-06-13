import {OnInit, Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ChangeDetectorRef, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonNestedDataSource, JsonNestedNode} from './nested-data-source'
import {CdkNodePlaceholder, SelectionModel, CdkTree, TreeControl, FlatTreeControl, NestedTreeControl} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'nested-tree-node',
  templateUrl: 'nested-tree-node.html',
  styleUrls: ['nested-tree-node.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class NestedTreeNode {


  @ViewChild(CdkNodePlaceholder) nodePlaceholder: CdkNodePlaceholder;
  @Input() node: any;
  @Input() level: number;
  @Input() expandable: boolean;
  @Input() expandIncludeChildren: boolean;
  @Input() selection: SelectionModel<any>;
  @Input() selected: boolean;
  @Input() dataSource: JsonNestedDataSource;
  @Input() treeControl: NestedTreeControl<JsonNestedNode>;

  constructor(public tree: CdkTree, public changeDetectorRef: ChangeDetectorRef) {}

  createArray(level: number) {
    return new Array(level);
  }

  getChildren(node: any) {
    return node.children;
  }

  getSpecial(node: any, index: number) {
    let levels = this.dataSource.dottedLineLevels.get(node);
    return !!levels && levels.indexOf(index) != -1;
  }

  selectNode(node: any, event: any) {
    this.selection.toggle(node);
    let select = this.selection.isSelected(node);
    let decedents = this.treeControl.getDecedents(node);
    decedents.forEach((decedent: JsonNestedNode) => {
      select ? this.selection.select(decedent) : this.selection.deselect(decedent);
    });
    this.changeDetectorRef.markForCheck();
  }
}
