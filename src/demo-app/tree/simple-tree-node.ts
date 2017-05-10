import {OnInit, Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {MdNodePlaceholder, SelectionModel, CdkTree} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-node',
  templateUrl: 'simple-tree-node.html',
  styleUrls: ['simple-tree-node.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeNode {


  @ViewChild(MdNodePlaceholder) nodePlaceholder: MdNodePlaceholder;
  @Input() flat: boolean;
  @Input() node: any;
  @Input() level: number;
  @Input() expandable: boolean;
  @Input() expandIncludeChildren: boolean;
  @Input() selection: SelectionModel<any>;
  @Input() dataSource: JsonDataSource;

  constructor(public tree: CdkTree) {}

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
}
