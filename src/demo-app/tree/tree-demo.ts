import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {PersonDataSource} from './data-source'
import {SelectionModel, MdTree} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDemo {
  selection = new SelectionModel<UserData>(true, []);
  dataSource: PersonDataSource;

  @ViewChild(MdTree) tree: MdTree;

  constructor(private peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.dataSource = new PersonDataSource(this.peopleDatabase);

  }

  get expansionModel() {
    return this.dataSource.expansionModel;
  }

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  toggleExpand(node: UserData) {
    this.dataSource.expansionModel.toggle(node);
  }

  refreshData() {
    this.dataSource.refresh();
  }

  gotoParent(node: UserData) {
    this.tree.gotoParent(node);
  }
}
