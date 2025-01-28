/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
export interface NestedFoodNode {
  name: string;
  children?: NestedFoodNode[];
}

export const NESTED_DATA: NestedFoodNode[] = [
  {
    name: 'Fruit',
    children: [{name: 'Apple'}, {name: 'Banana'}, {name: 'Fruit loops'}],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{name: 'Broccoli'}, {name: 'Brussels sprouts'}],
      },
      {
        name: 'Orange',
        children: [{name: 'Pumpkins'}, {name: 'Carrots'}],
      },
    ],
  },
];
