import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {SelectionModel, MdTree} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-node',
  templateUrl: 'simple-tree-node.html',
  styleUrls: ['simple-tree-node.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeNode {


  @Input() flat: boolean;
  @Input() node: any;
  @Input() level: number;
  @Input() expandable: boolean;
  @Input() expandIncludeChildren: boolean;
  @Input() selection: SelectionModel<any>;
  @Input() dataSource: JsonDataSource;

  createArray(level: number) {
    return new Array(level);
  }

  getChildren(node: any) {
    return node.children;
  }

  dotline(node: any, index: number) {
    let data = this.dataSource.dottedLineLevels.get(node);
    return !!data && data.indexOf(index) != -1;
  }
}
