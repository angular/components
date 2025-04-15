import {$, cd} from 'zx';

import path from 'node:path';
import {ProductionDeployment} from '../deploy-to-site.mjs';
import {projectDir, sites} from '../utils.mjs';

/**
 * Runs monitoring tests for the given docs repository, ensuring that the
 * specified remote URL is properly functioning.
 */
export async function runMonitorTests(remoteUrl: string) {
  await $`pnpm bazel run //docs:audit_tool -- ${remoteUrl}`;
}

/** Runs the monitoring tests for the stable release train. */
export async function runMonitorTestsForStable() {
  await runMonitorTests(sites.stable.remoteUrl);
}

/** Runs monitoring tests for all specified production deployments. */
export async function runMonitoringTests(targets: ProductionDeployment[]) {
  for (const target of targets) {
    await runMonitorTests(target.site.remoteUrl);
  }
}
