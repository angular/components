import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
import {Portal, MdTreeNode, ComponentPortal} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'tree-demo',
  templateUrl: 'tree-demo.html',
  styleUrls: ['tree-demo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // make sure tooltip also works OnPush
})
export class TreeDemo {
  nodeTemplate: Portal<any> = new ComponentPortal(TreeNodeKey);
  expandedKeys: string[] = ['apple', 'pear'];
}

@Component({
  moduleId: module.id,
  selector: 'tree-node-key',
  template: `<md-checkbox [(ngModel)]="node.selected" >{{node.title}} </md-checkbox>`,
})
export class TreeNodeKey {
  @Input() node: MdTreeNode;
}