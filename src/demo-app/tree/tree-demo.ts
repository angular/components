import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, ViewChild, QueryList, TemplateRef} from '@angular/core';
import {UserData, PeopleDatabase} from './person-database';
import {PersonDataSource} from './data-source'
import {SelectionModel, CdkTree, CdkNode} from '@angular/material';

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
  showDottedLine: boolean = false;

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


@Component({
  moduleId: module.id,
  selector: 'tree-dotted-line',
  template: `<div class="space">
               <div *ngFor="let level of levels; let index = index" 
                    [class.special]="hasLine(index)">
               </div>
             </div>`,
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDottedLine {
  levels: number[];

  constructor(public tree: CdkTree, public node: CdkNode) {
    this.levels = new Array(this.node.level);
  }

  createArray() {
    return new Array(this.node.level);
  }

  hasLine(index: number) {
    return (this.tree.dataSource as PersonDataSource).dottedLineLevels
        .get(this.node.data).indexOf(index) != -1;
  }
}


@Component({
  moduleId: module.id,
  selector: 'tree-expansion',
  template: `<a md-icon-button [cdkNodeTrigger]="node.data" 
                               [cdkNodeTriggerRecursive]="expandRecursive" 
                               [cdkNodeTriggerSelection]="expansionModel">
               <md-icon *ngIf="node.expandable">
                 {{icon}}
               </md-icon>
             </a>`,
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeExpansion {
  @Input() expandRecursive: boolean;

  get expansionModel() {
    return this.tree.dataSource.expansionModel;
  }

  get icon() {
    return this.expansionModel.isSelected(this.node.data) ? 'arrow_drop_up' : 'arrow_drop_down';
  }

  constructor(public tree: CdkTree, public node: CdkNode) {}
}

