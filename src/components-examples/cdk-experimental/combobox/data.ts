export interface TreeNode {
  name: string;
  children?: TreeNode[];
}

export const TREE_NODES = [
  {
    name: 'Winter',
    children: [{name: 'December'}, {name: 'January'}, {name: 'February'}],
  },
  {
    name: 'Spring',
    children: [{name: 'March'}, {name: 'April'}, {name: 'May'}],
  },
  {
    name: 'Summer',
    children: [{name: 'June'}, {name: 'July'}, {name: 'August'}],
  },
  {
    name: 'Fall',
    children: [{name: 'September'}, {name: 'October'}, {name: 'November'}],
  },
];
