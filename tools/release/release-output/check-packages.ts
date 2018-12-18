import {bold, red, yellow} from 'chalk';
import {sync as glob} from 'glob';
import {join} from 'path';
import {checkMaterialPackage, checkReleaseBundle} from './output-validations';

/** Glob that matches all JavaScript bundle files within a release package. */
const releaseBundlesGlob = '+(esm5|esm2015|bundles)/*.js';

/**
 * Checks a specified release package against generic and package-specific output validations.
 * Validations are added in order to ensure that build system changes do not cause an
 * unexpected release output (e.g. the theming bundle is no longer generated)
 */
export function checkReleasePackage(releasesPath: string, packageName: string): boolean {
  const bundleNames = glob(`${packageName}/${releaseBundlesGlob}`, {cwd: releasesPath});
  let hasFailures = false;

  // We want to walk through each bundle within the current package and run
  // release validations that ensure that the bundles are not invalid.
  bundleNames.forEach(bundleName => {
    const failures = checkReleaseBundle(join(releasesPath, bundleName));

    if (failures.length) {
      hasFailures = true;
      printValidationFailures(bundleName, failures);
    }
  });

  // Special release validation checks for the "material" release package.
  if (packageName === 'material') {
    const failures = checkMaterialPackage(join(releasesPath, packageName));

    if (failures.length) {
      hasFailures = true;
      printValidationFailures('Material package', failures);
    }
  }

  return hasFailures;
}

/** Prints the given release validation failures for a specified bundle. */
function printValidationFailures(name: string, failures: string[]) {
  console.error(yellow(`  ⚠   "${bold(name)}" does not pass release validations:`));
  failures.forEach(failureMessage => console.error(yellow(`  ⮑   ${failureMessage}`)));
  console.error();
}
