/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import axe from 'axe-core';

// Basic ANSI color functions because chalk has issues with unit tests.
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  underline: (text: string) => `\x1b[4m${text}\x1b[0m`,
  default: (text: string) => `\x1b[0m${text}\x1b[0m`,
};

/**
 * Runs accessibility checks on a specified HTML element using the axe-core library.
 * @param root The root HTML element to check for accessibility violations.
 */
export async function runAccessibilityChecks(root: HTMLElement): Promise<void> {
  const results = await axe.run(root);

  if (!results.violations.length) {
    return;
  }

  const reportLines: string[] = [];
  const append = (text: string) => reportLines.push(colors.default(text));
  append(colors.red(`Found ${results.violations.length} accessibility violation(s):`));

  results.violations.forEach((violation, index) => {
    append('');
    append(colors.red(`Violation ${index + 1}: ${violation.id}\n`));

    let impactText = violation.impact || 'unknown';
    switch (violation.impact) {
      case 'critical':
        impactText = colors.red(impactText);
        break;
      case 'serious':
        impactText = colors.yellow(impactText);
        break;
      case 'moderate':
        impactText = colors.blue(impactText);
        break;
      case 'minor':
        impactText = colors.gray(impactText);
        break;
      default:
        impactText = colors.default(impactText);
        break;
    }

    append(`  Impact: ${impactText}`);
    append(`  Description: ${violation.description}`);
    append(`  Help: ${violation.help}`);
    append(`  Help URL: ${colors.underline(colors.blue(violation.helpUrl))}\n`);

    if (violation.nodes && violation.nodes.length > 0) {
      append('  Failing Elements:');
      violation.nodes.forEach((node, nodeIndex) => {
        append(colors.cyan(`    Node ${nodeIndex + 1}:`));
        if (node.target && node.target.length > 0) {
          append(`      Selector: ${colors.magenta(node.target.join(', '))}`);
        }
        if (node.failureSummary) {
          append('      Failure Summary:');
          node.failureSummary
            .split('\n')
            .forEach(line => append(colors.yellow(`        ${line.trim()}`)));
        }
      });
    }
  });

  fail(reportLines.join('\n'));
}
