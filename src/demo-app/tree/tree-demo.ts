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

  getPadding(level: number) {
    return `${(level - 1) * 45}px`;
  }

  toggleExpand(node: UserData) {
    this.tree.toggleExpand(node);
  }

  expansionModel = new SelectionModel<UserData>(true, []);
}
