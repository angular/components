#!/bin/env node
'use strict';

/**
 * Usage:
 * ```sh
 * node tools/audit-docs <deploy-dir|url> <delay>
 * ```
 *
 * Runs the configured audits on several (pre-defined) pages on the specified
 * origin. It fails if any score for any page is below the minimum (see
 * `MIN_SCORES_PER_PAGE` below).
 *
 *  <deploy-dir> is a path to a directory which should be served and tested.
 *
 * `<url>` is the origin (scheme + hostname + port) of an material.angular.io
 *  deployment. It can be remote (e.g. `https://next.material.angular.io`) or local (e.g.
 *  `http://localhost:4200`).
 *
 * `<delay>` is a millisecond value used with `setTimeout()` to allow a configurable delay
 *  for the HTTP server to start up. This is needed when used with `firebase serve`.
 */

// Imports
const sh = require('shelljs');
sh.set('-e');

const lightServer = require('light-server');

// Constants

// Individual page a11y scores
const MIN_A11Y_SCORES_PER_PAGE = {
  '': 100,
  'components/categories': 91,
  'cdk/categories': 91,
  guides: 100,
  'guide/creating-a-custom-form-field-control': 97,
  'guide/getting-started': 96,
  'cdk/a11y/overview': 85,
  'cdk/a11y/api': 89,
  'cdk/a11y/examples': 85,
  'components/button/overview': 92,
  'components/button/api': 89,
  'components/button/examples': 90,
};

/**
 * @type {{minScores: {performance: number, accessibility: number, 'best-practices': number, pwa: number, seo: number}, url: string}[]}
 */
const MIN_SCORES_PER_PAGE = [
  {
    url: '',
    minScores: {
      pwa: 70,
      performance: 25,
      seo: 98,
      'best-practices': 100,
      accessibility: 100,
    },
  },
  ...Object.entries(MIN_A11Y_SCORES_PER_PAGE).map(([url, accessibility]) => ({
    url,
    minScores: {accessibility},
  })),
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

// Launch the light-server to run tests again
const urlOrDeployDir = process.argv[2];
const delay = process.argv[3];
let origin = urlOrDeployDir;

// If a directory has been specified instead of an origin,
// we start light server for this directory.
if (!/https?:\/\//.test(urlOrDeployDir)) {
  const bind = 'localhost';
  const port = 4200;

  origin = `http://${bind}:${port}`;
  console.log('Launch audit HTTP server...');

  lightServer({
    port,
    bind,
    serve: urlOrDeployDir,
    quiet: true,
    noReload: true,
    historyindex: '/index.html',

    // Defaults from .bin/light-server
    interval: 500,
    delay: 0,
    proxypaths: ['/'],
    watchexps: [],
  }).start();
}

// Run the a11y audit against the above pages
const lighthouseAuditCmd = `"${process.execPath}" "${__dirname}/lighthouse-audit"`;

setTimeout(async function () {
  console.log('Run audit tests...');
  console.log('Origin:', origin);

  try {
    for (const {url, minScores} of MIN_SCORES_PER_PAGE) {
      await new Promise((resolve, reject) => {
        const cp = sh.exec(`${lighthouseAuditCmd} ${origin}/${url} ${formatScores(minScores)}`, {
          async: true,
        });

        cp.on('error', reject);
        cp.on('exit', err => (err ? reject : resolve)(err));
      });
    }

    process.exit(0);
  } catch (e) {
    console.log('Audit failure: ', e);
    process.exit(1);
  }
}, delay);
