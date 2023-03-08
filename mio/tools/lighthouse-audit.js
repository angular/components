#!/bin/env node
'use strict';

// Imports
const lighthouse = require('lighthouse');
const printer = require('lighthouse/lighthouse-cli/printer');
const logger = require('lighthouse-logger');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '../');
const reportsDir = path.join(projectDir, 'dist/reports');

// Constants
const AUDIT_CATEGORIES = ['accessibility', 'best-practices', 'performance', 'pwa', 'seo'];
/**
 * @type {LH.Flags}
 */
const LIGHTHOUSE_FLAGS = {
  logLevel: process.env.CI ? 'error' : 'info',
}; // Be less verbose on CI.
const SKIPPED_HTTPS_AUDITS = ['uses-long-cache-ttl', 'canonical', 'uses-text-compression'];
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer';
const WAIT_FOR_SW_DELAY = 5000;

// Run
_main(process.argv.slice(2)).then(() => console.log('Audit completed.'));

// Functions - Definitions

/**
 * Usage:
 * ```sh
 * node tools/lighthouse-audit <url> <min-scores> [<log-file>]
 * ```
 *
 * Runs audits against the specified URL on specific categories (accessibility,
 * best practices, performance, PWA, SEO). It fails, if the score in any
 * category is below the score specified in `<min-scores>`. (Only runs audits
 * for the specified categories.)
 *
 * `<min-scores>` is either a number (in which case it is interpreted as
 * `all:<min-score>`) or a list of comma-separated strings of the form
 * `key:value`, where `key` is one of `accessibility`, `best-practices`,
 * `performance`, `pwa`, `seo` or `all` and `value` is a number (between 0 and 100).
 *
 * Examples:
 * - `95`: Same as `all:95`.
 * - `all:95`: Run audits for all categories and require a score of 95 or higher.
 * - `all:95,pwa:100`: Same as `all:95`, except that a score of 100 is required for the
 *    `pwa` category.
 * - `performance:90`: Only run audits for the `performance` category and require a score of 90
 *    or higher.
 *
 * If `<log-file>` is defined, the full results will be logged there.
 *
 * Skips HTTPS-related audits, when run for an HTTP URL.
 *
 * Originally from https://github.com/angular/angular/blob/ab8199f7c909eaa8937d293ab44405fe263417cd/aio/scripts/audit-web-app.js
 *
 * @param {string[]} args <url> <min-scores> [<log-file>]
 * @returns {Promise<void>}
 * @private
 */
async function _main(args) {
  const {url, minScores} = parseInput(args);
  const isOnHttp = /^http:/.test(url);
  /**
   * @type {LH.Flags}
   */
  const lhFlags = {
    ...LIGHTHOUSE_FLAGS,
    onlyCategories: Object.keys(minScores).sort(),
  };
  /**
   * @type {LH.Config.Json}
   */
  const lhConfig = {
    extends: 'lighthouse:default',
    // Since the Angular ServiceWorker waits for the app to stabilize before
    // registering, wait a few seconds after load to allow Lighthouse to
    // reliably detect it.
    passes: [{passName: 'defaultPass', pauseAfterLoadMs: WAIT_FOR_SW_DELAY}],
  };

  await cleanupAndPrepareReportsDir();

  // Always generate report/log files.
  const logFile = path.join(reportsDir, `${url.replace(/\//g, '-')}--report.json`);

  console.log(`Running web-app audits for '${url}'...`);
  console.log(`  Audit categories: ${lhFlags.onlyCategories.join(', ')}`);

  // If testing on HTTP, skip HTTPS-specific tests.
  // (Note: Browsers special-case localhost and run ServiceWorker even on HTTP.)
  if (isOnHttp) {
    skipHttpsAudits(lhConfig);
  }

  logger.setLevel(lhFlags.logLevel);

  try {
    console.log();
    const startTime = Date.now();
    const results = await launchChromeAndRunLighthouse(url, lhFlags, lhConfig);
    if (!results) {
      onError('Lighthouse failed to return any results.');
    }
    const success = await processResults(results, minScores, logFile);
    console.log(`\n(Completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s.)\n`);

    if (!success) {
      onError('One or more scores are below the minimum required.');
    }
  } catch (err) {
    onError(err);
  }
}

/**
 * @param {number} score
 * @returns {string} the formatted audit score value
 */
function formatScore(score) {
  return `${(score * 100).toFixed(0).padStart(3)}`;
}

/**
 * @param {string} url the URL to run Lighthouse against
 * @param {LH.Flags} flags Lighthouse flags
 * @param {LH.Config.Json} config Lighthouse JSON config
 * @returns {Promise<LH.RunnerResult | undefined>} the result of the Lighthouse run
 */
async function launchChromeAndRunLighthouse(url, flags, config) {
  const browser = await puppeteer.launch({
    // Allow for a custom chromium to be provided (e.g. for M1 native support)
    executablePath: process.env.CHROMIUM_BIN,
  });
  flags.port = new URL(browser.wsEndpoint()).port;

  try {
    return await lighthouse(url, flags, config);
  } finally {
    await browser.close();
  }
}

/**
 * @param {string} err the error message
 */
function onError(err) {
  console.error(err);
  console.error('');
  process.exit(1);
}

async function cleanupAndPrepareReportsDir() {
  try {
    await fs.promises.rm(reportsDir, {recursive: true});
  } catch {}

  await fs.promises.mkdir(reportsDir, {recursive: true});
}

/**
 * Parse CLI args and throw errors if any are invalid.
 * @param {string[]} args <url> <min-scores> [<log-file>]
 * @returns {{url: string, minScores: {all?: number, performance?: number, accessibility?: number, 'best-practices'?: number, pwa?: number, seo?: number}}}
 *  the validated URL, parsed minimum scores, and optional file path to write the report to
 */
function parseInput(args) {
  const [url, minScoresRaw] = args;

  if (!url) {
    onError('Invalid arguments: <url> not specified.');
  } else if (!minScoresRaw) {
    onError('Invalid arguments: <min-scores> not specified.');
  }

  const minScores = parseMinScores(minScoresRaw || '');
  const unknownCategories = Object.keys(minScores).filter(cat => !AUDIT_CATEGORIES.includes(cat));
  const allValuesValid = Object.values(minScores).every(x => 0 <= x && x <= 1);

  if (unknownCategories.length > 0) {
    onError(
      `Invalid arguments: <min-scores> contains unknown category(-ies): ${unknownCategories.join(
        ', '
      )}`
    );
  } else if (!allValuesValid) {
    onError(
      `Invalid arguments: <min-scores> has non-numeric or out-of-range values: ${minScoresRaw}`
    );
  }

  return {url, minScores};
}

/**
 * @param {string} raw is either a number (in which case it is interpreted as `all:<min-score>`)
 *  or a list of comma-separated strings of the form `key:value`, where `key` is one of
 *  `accessibility`, `best-practices`, `performance`, `pwa`, `seo` or `all` and `value` is a
 *  number (between 0 and 100).
 *
 * @example
 * - `95`: Same as `all:95`.
 * - `all:95`: Run audits for all categories and require a score of 95 or higher.
 * - `all:95,pwa:100`: Same as `all:95`, except that a score of 100 is required for the
 *    `pwa` category.
 * - `performance:90`: Only run audits for the `performance` category and require a score of 90
 *    or higher.
 * @returns {{all?: number, performance?: number, accessibility?: number, 'best-practices'?: number, pwa?: number, seo?: number}} an object representing the minimum acceptable scores for each audit category
 */
function parseMinScores(raw) {
  const minScores = {};

  if (/^\d+$/.test(raw)) {
    raw = `all:${raw}`;
  }

  raw
    .split(',')
    .map(x => x.split(':'))
    .forEach(([key, val]) => (minScores[key] = Number(val) / 100));

  if (minScores.hasOwnProperty('all')) {
    AUDIT_CATEGORIES.forEach(
      cat => minScores.hasOwnProperty(cat) || (minScores[cat] = minScores.all)
    );
    delete minScores.all;
  }

  return minScores;
}

/**
 * @param {LH.RunnerResult} results from a Lighthouse run
 * @param {{all?: number, performance?: number, accessibility?: number, 'best-practices'?: number, pwa?: number, seo?: number}} minScores the minimum acceptable scores for each audit category
 * @param {string=} logFile optional file path to write the report to
 * @returns {Promise<boolean>} true if all of the scores were above the required min scores, false otherwise
 */
async function processResults(results, minScores, logFile) {
  const lhVersion = results.lhr.lighthouseVersion;
  const categories = results.lhr.categories;
  const report = results.report;

  if (logFile) {
    console.log(`\nSaving results in '${logFile}'...`);
    console.log(`  LightHouse viewer: ${VIEWER_URL}`);

    await printer.write(report, printer.OutputMode.json, logFile);
  }

  console.log(`\nLighthouse version: ${lhVersion}`);
  console.log('\nAudit results:');

  const maxTitleLen = Math.max(...Object.values(categories).map(({title}) => title.length));
  return Object.keys(categories)
    .sort()
    .reduce((aggr, cat) => {
      const {title, score} = categories[cat];
      const paddedTitle = `${title}:`.padEnd(maxTitleLen + 1);
      const minScore = minScores[cat];
      const passed = !isNaN(score) && score >= minScore;

      console.log(
        `  - ${paddedTitle}  ${formatScore(score)}  (Required: ${formatScore(minScore)})  ${
          passed ? 'OK' : 'FAILED'
        }`
      );

      return aggr && passed;
    }, true);
}

/**
 * Logs the audits skipped based on the contents of a constant and updates the Lighthouse
 * config to skip those audits.
 * @param {LH.Config.Json} config
 */
function skipHttpsAudits(config) {
  console.log(`  Skipping HTTPS-related audits: ${SKIPPED_HTTPS_AUDITS.join(', ')}`);
  config.settings = {...config.settings, skipAudits: SKIPPED_HTTPS_AUDITS};
}
