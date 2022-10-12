import {Component, NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule, MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatButtonModule} from '@angular/material/button';

type IconType = 'folder' | 'text_snippet';

interface FileNode {
  name: string;
  children?: FileNode[];
  icon: IconType;
}

const TREE_DATA: FileNode[] = [
  {
    name: 'src',
    icon: 'folder',
    children: [
      {name: 'app', icon: 'folder'},
      {name: 'assets', icon: 'folder'},
      {name: 'index.html', icon: 'text_snippet'},
    ],
  },
];

interface FileFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  icon: IconType;
}

@Component({
  selector: 'app-tree-scene',
  templateUrl: './tree-scene.html',
  styleUrls: ['./tree-scene.scss'],
})
export class TreeScene {
  treeControl = new FlatTreeControl<FileFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
    this.treeControl.expandAll();
  }

  private _transformer(node: FileNode, level: number) {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      icon: node.icon,
    };
  }

  hasChild = (_: number, node: FileFlatNode) => node.expandable;
}

@NgModule({
  imports: [MatIconModule, MatTreeModule, MatButtonModule],
  exports: [TreeScene],
  declarations: [TreeScene],
})
export class TreeSceneModule {}
