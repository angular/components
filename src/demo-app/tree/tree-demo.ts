import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {PersonDataSource} from './data-source'
import {SelectionModel} from '@angular/material';

@Directive({
  selector: 'md-tree-node',
  host: {
    '[class.mat-tree-node]': 'true',
  },
})
export class MdTreeNode {

}


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

  constructor(private peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.dataSource = new PersonDataSource(this.peopleDatabase);
  }
}
