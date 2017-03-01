export class TreeNodeModel {
  key: string;
  expanded: boolean;
  selected: boolean;
  children: TreeNodeModel[];
  parent: TreeNodeModel;
}