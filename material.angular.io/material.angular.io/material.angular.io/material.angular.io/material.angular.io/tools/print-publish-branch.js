/**
 * Script that resolves the proper publish branch (e.g. 6.4.x, 6.4 or master) for the currently
 * installed version of Angular Material.
 *
 * This is needed because we cannot have a older version of Angular Material installed, while we
 * pull the docs content for `master`. This causes the docs to not build at all.
 */

const materialVersion = require('@angular/material/package.json').version;
const versionMatch = materialVersion.match(/^\d+\.\d+\.\d/);

if (!versionMatch) {
  console.error(`Could not determine publish branch for version:${materialVersion}`);
  process.exit(1);
}

const [major, minor, patch] = versionMatch[0].split('.');

if (minor === '0' && patch === '0') {
  console.log('master');
} else if (patch === '0') {
  console.log(`${major}.x`);
} else {
  console.log(`${major}.${minor}.x`);
}
