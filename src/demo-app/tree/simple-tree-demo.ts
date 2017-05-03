import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {JsonDataSource} from './simple-data-source'
import {SelectionModel, MdTree} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'simple-tree-demo',
  templateUrl: 'simple-tree-demo.html',
  styleUrls: ['simple-tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class SimpleTreeDemo {
  data: string = '';

  submit() {
    try {
      var obj = JSON.parse(this.data);
      this.dataSource.data = obj;
    } catch (e) {
      console.log(e);
    };
  }
  selection = new SelectionModel<UserData>(true, []);
  dataSource: JsonDataSource = new JsonDataSource();

  @ViewChild(MdTree) tree: MdTree;

  constructor() { }


  expandIncludeChildren: boolean = true;

  get expansionModel() {
    return this.dataSource.expansionModel;
  }

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  toggleExpand(node: UserData) {
    this.dataSource.expansionModel.toggle(node);
  }

  gotoParent(node: UserData) {
    this.tree.gotoParent(node);
  }

  expandAll() {
    this.tree.toggleAll(true);
  }

  collapseAll() {
    this.tree.toggleAll(false);
  }

  expand(node: UserData) {
    this.tree.toggleAll(true, node);
  }

  collapse(node: UserData) {
    this.tree.toggleAll(false, node);
  }

  createArray(level: number) {
    return new Array(level);
  }
}
