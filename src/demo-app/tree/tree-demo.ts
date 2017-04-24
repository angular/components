import {Component, ChangeDetectionStrategy, Directive, Input, ViewChildren, QueryList, TemplateRef} from '@angular/core';
import {TreeDemoDataSource, Character, CHARACTERS} from './data-source';
import {TreeModel} from '@angular/material';

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

  dataSource = new TreeDemoDataSource();
  treeModel: TreeModel<Character> = new TreeModel<Character>(this.dataSource, true /* flat tree */);

  lastNodeClicked: Character;

  characterIsVillan(node: Character): boolean {
    return node.villan;
  }

  // getPadding(level: number) {
  //   return this.treeModel.isFlatTree ? `${level  *  20}px` : '0';
  // }

  customerClickAction(event: any) {
    console.log(`custom click action clicked ${event}`);
  }

  customerSelectFunction(data: Character) {
    console.log(`customer select function selected ${data.name}`);
  }

  onTreeExpanded(expanded: Character[]) {
    console.log(`on tree expanded`);
    console.log(expanded);
  }

  get nodes() {
    return CHARACTERS;
  }

  getKeyFunction = (node: any) => {
    console.log(`get key function ${node} ${node.id}`);
    return node.id;
  };

  getChildrenFunction = (node: Character) => {
    console.log(`get children function ${node} ${node.id}`);
    return node.children;
  };
}
