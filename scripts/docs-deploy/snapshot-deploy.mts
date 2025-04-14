import {DeploymentInfo, deployToSite, isProductionDeployment} from './deploy-to-site.mjs';

import {runMonitoringTests} from './monitoring/index.mjs';
import {buildDocsSite, projectDir} from './utils.mjs';

export type DeploymentConfig = {
  /**
   * Optional hook running before building the docs-app for deployment.
   */
  prebuild?: (workspaceDir: string) => Promise<void> | void;
};

/**
 * Builds and deploys the docs app with snapshot artifacts built
 * from the currently checked-out `angular/components` `HEAD`.
 *
 * This allows us to build the library artifacts and docs-content
 * directly without needing to wait for e.g. NPM to finish.
 *
 * One downside is that the docs site might be ahead of what is available
 * on NPM, potentially causing examples to not work in StackBlitz. These should
 * never break though since the stable release train is supposed to never receive
 * breaking changes (i.e. `material.angular.io` Stackblitz should work as expected).
 *
 * Building based on the NPM packages would result in some inevitable complexity.
 * For example: we would know that `13.2.0` is our latest release. We would need
 * to wait for the NPM packages to be available (in case CI runs for the bump commit).
 * Since packages will not be available and CI cannot wait for this to happen, the
 * caretaker would need to manually re-run the job. Additionally it would require some
 * additional rather complicated logic to find the proper matching docs-content revision.
 */
export async function buildAndDeployWithSnapshots(
  firebaseServiceKey: string,
  major: number,
  targets: DeploymentInfo[],
  options: DeploymentConfig = {},
) {
  console.log(`Building and deploying with snapshot builds.`);
  console.log(`The following deployment targets are defined:`);
  for (const target of targets) {
    console.log(`  - ${target.projectId}:${target.site.firebaseSiteId} | ${target.site.remoteUrl}`);
  }

  // Run the prebuild hook if available.
  await options.prebuild?.(projectDir);

  // Build the production output (we always use HEAD packages).
  await buildDocsSite();

  // Deploy all targets to Firebase.
  for (const target of targets) {
    await deployToSite(projectDir, firebaseServiceKey, target);
  }

  // Run post monitoring tests for production deployments.
  await runMonitoringTests(targets.filter(isProductionDeployment));
}
