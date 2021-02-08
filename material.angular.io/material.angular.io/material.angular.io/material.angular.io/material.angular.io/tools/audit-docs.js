#!/bin/env node
'use strict';

/**
 * Usage:
 * ```sh
 * node tools/audit-docs <origin> <delay>
 * ```
 *
 * Runs the configured audits on several (pre-defined) pages on the specified
 * origin. It fails if any score for any page is below the minimum (see
 * `MIN_SCORES_PER_PAGE` below).
 *
 * `<origin>` is the origin (scheme + hostname + port) of an material.angular.io
 *  deployment. It can be remote (e.g. `https://next.material.angular.io`) or local (e.g.
 *  `http://localhost:4200`).
 *
 * `<delay>` is a millisecond value used with `setTimeout()` to allow a configurable delay
 *  for the HTTP server to start up. This is needed when used with `firebase serve`.
 */

// Imports
const sh = require('shelljs');
sh.set('-e');

// Constants
/**
 * @type {{minScores: {performance: number, accessibility: number, 'best-practices': number, pwa: number, seo: number}, url: string}[]}
 */
const MIN_SCORES_PER_PAGE = [
  {
    url: '',
    minScores: {
      'pwa': 70,
      'performance': 20,
      'seo': 98,
      'best-practices': 100,
      'accessibility': 100
    }
  }
];

/**
 * @param {{performance?: number, accessibility?: number, 'best-practices'?: number, pwa?: number, seo?: number}} scores
 * @returns string scores formatted as described in the docs of lighthouse-audit.js's _main()
 */
function formatScores(scores) {
  let formattedScores = '';
  Object.keys(scores).map((key, index) => {
    if (index > 0) {
      formattedScores += ',';
    }
    formattedScores += `${key}:${scores[key]}`;
  });
  return formattedScores;
}

// Run the a11y audit against the above pages
const lighthouseAuditCmd = `"${process.execPath}" "${__dirname}/lighthouse-audit"`;
const origin = process.argv[2];
const delay = process.argv[3];
if (delay) {
  setTimeout(_main, delay);
} else {
  _main();
}

function _main() {
  MIN_SCORES_PER_PAGE.map((urlsAndScores) => {
    sh.exec(`${lighthouseAuditCmd} ${origin}/${urlsAndScores.url} ${formatScores(urlsAndScores.minScores)}`);
  });
}
