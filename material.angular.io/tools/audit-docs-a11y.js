#!/bin/env node
'use strict';

/**
 * Originally from https://github.com/angular/angular/blob/b48eabddb83900496e5e00fb98e192c6c49dff26/aio/scripts/test-aio-a11y.js
 *
 * Usage:
 * ```sh
 * node tools/audit-docs-a11y <origin>
 * ```
 *
 * Runs accessibility audits on several (pre-defined) pages on the specified
 * origin. It fails, if the score for any page is below the minimum (see
 * `MIN_SCORES_PER_PAGE` below).
 *
 * `<origin>` is the origin (scheme + hostname + port) of an material.angular.io
 * deployment. It can be remote (e.g. `https://next.material.angular.io`) or local (e.g.
 * `http://localhost:4200`).
 */

// Imports
const sh = require('shelljs');
sh.set('-e');

// Constants
const MIN_SCORES_PER_PAGE = {
  '' : 100,
  'components/categories' : 91,
  'cdk/categories' : 91,
  'guides' : 100,
  'guide/creating-a-custom-form-field-control' : 99,
  'guide/getting-started' : 98,
  'cdk/a11y/overview' : 85,
  'cdk/a11y/api' : 89,
  'cdk/a11y/examples' : 85,
  'components/button/overview' : 92,
  'components/button/api' : 89,
  'components/button/examples' : 90,
};

// Run the a11y audit against the above pages
const lighthouseAuditCmd = `"${process.execPath}" "${__dirname}/lighthouse-audit"`;
const origin = process.argv[2];
for (const [page, minScore] of Object.entries(MIN_SCORES_PER_PAGE)) {
  sh.exec(`${lighthouseAuditCmd} ${origin}/${page} accessibility:${minScore}`);
}
