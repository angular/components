import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
import {NgForTreeContext} from '@angular/material';
import {TreeDemoDataSource, Character} from './data-source';

@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDemo {
  dataSource = new TreeDemoDataSource();

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
}
