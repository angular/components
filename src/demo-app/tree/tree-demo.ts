import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {PersonDataSource} from './data-source'
import {SelectionModel, CdkTree} from '@angular/material';

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
  showDottedLine: boolean = true;

  @ViewChild(CdkTree) tree: CdkTree;

  constructor(private peopleDatabase: PeopleDatabase) { }

  ngOnInit() {
    this.dataSource = new PersonDataSource(this.peopleDatabase);
  }

  expandRecursive: boolean = true;
  selectRecursive: boolean = true;

  get expansionModel() {
    return this.dataSource.expansionModel;
  }

  expandAll() {
    this.tree.toggleAll(true);
  }

  collapseAll() {
    this.tree.toggleAll(false);
  }

  createArray(level: number) {
    return new Array(level);
  }

  stop(event: any) {
    console.log(event);
    event.stopPropagation()
  }
}
