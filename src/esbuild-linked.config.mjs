/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export default {
  conditions: ['ng-linked', 'module'],
  tsconfig: import.meta.dirname + '/bazel-tsconfig-build.json',
  resolveExtensions: ['.js'],
};
