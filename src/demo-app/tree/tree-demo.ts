import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, QueryList, TemplateRef} from '@angular/core';
import {NgForTreeContext} from '@angular/material';
import {TreeDemoDataSource, Character} from './data-source';


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
  @ViewChildren(TemplateRef) templateRefs: QueryList<TemplateRef<any>>;
  myContext = {$implicit: 'World', localSk: 'Svet'};
  dataSource = new TreeDemoDataSource();
  templateRef: any;

  lastNodeClicked: Character;

  characterIsVillan(node: Character): boolean {
    return node.villan;
  }

  lastCharacterDisplayed(node: Character, context: NgForTreeContext) {
    return context.last;
  }

  nodeClicked(row: Character) {
    this.lastNodeClicked = row;
  }

  getPadding(level: number) {
    return `${level  *  20}px`;
  }

  changeTemplate(value: number) {
    console.log(`change template ${value}`);
    console.log(this.templateRefs);
    this.templateRef = this.templateRefs.toArray()[value];
  }

  myTree = [
    { text: "foo", items: [
      { text: "bar" },
      { text: "what"}
    ] },
    { text: "any"},
    { text: "any1"}
  ];
}
