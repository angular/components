/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export type TreeNode = {
  name: string;
  value: string;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
};

export const NODES: TreeNode[] = [
  {
    name: 'public',
    value: 'public',
    children: [
      {name: 'index.html', value: 'public/index.html'},
      {name: 'favicon.ico', value: 'public/favicon.ico'},
      {name: 'styles.css', value: 'public/styles.css'},
    ],
    expanded: false,
  },
  {
    name: 'src',
    value: 'src',
    children: [
      {
        name: 'app',
        value: 'src/app',
        children: [
          {name: 'app.component.ts', value: 'src/app/app.component.ts'},
          {name: 'app.module.ts', value: 'src/app/app.module.ts', disabled: true},
          {name: 'app.css', value: 'src/app/app.css'},
        ],
        expanded: false,
      },
      {
        name: 'assets',
        value: 'src/assets',
        children: [{name: 'logo.png', value: 'src/assets/logo.png'}],
        expanded: false,
      },
      {
        name: 'environments',
        value: 'src/environments',
        children: [
          {
            name: 'environment.prod.ts',
            value: 'src/environments/environment.prod.ts',
            expanded: false,
          },
          {name: 'environment.ts', value: 'src/environments/environment.ts'},
        ],
        expanded: false,
      },
      {name: 'main.ts', value: 'src/main.ts'},
      {name: 'polyfills.ts', value: 'src/polyfills.ts'},
      {name: 'styles.css', value: 'src/styles.css', disabled: true},
      {name: 'test.ts', value: 'src/test.ts'},
    ],
    expanded: false,
  },
  {name: 'angular.json', value: 'angular.json'},
  {name: 'package.json', value: 'package.json'},
  {name: 'README.md', value: 'README.md'},
];
