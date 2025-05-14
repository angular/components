import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';

import {$, cd} from 'zx';

/** Absolute path to the `angular/components` project root. */
export const projectDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Interface describing a site target for the docs-app. */
export class SiteTarget {
  constructor(
    public firebaseSiteId: string,
    public remoteUrl: string,
  ) {}
}

/** Object capturing all site targets for the docs-app. */
export const sites = {
  stable: new SiteTarget('latest-material-angular-io', 'https://material.angular.dev'),
  next: new SiteTarget('next-material-angular-io', 'https://next.material.angular.dev'),
  rc: new SiteTarget('rc-material-angular-io', 'https://rc.material.angular.dev'),

  forMajor: (major: number) =>
    new SiteTarget(`v${major}-material-angular-io`, `https://v${major}.material.angular.dev`),
};

/** Optional Github access token. Can be used for querying the active release trains. */
export const githubAccessToken: string | undefined = process.env['DOCS_DEPLOY_GITHUB_TOKEN'];

/** Configuration describing the Firebase project that we deploy to. */
export const firebaseConfig = {
  projectId: 'material-angular-io',
  serviceKey: process.env['DOCS_SITE_GCP_SERVICE_KEY']!,
};

/** Finds and parsed the `package.json` of the specified project directory. */
export async function getPackageJsonOfProject(
  projectPath: string,
): Promise<{path: string; parsed: any}> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8');

  return {
    path: packageJsonPath,
    parsed: JSON.parse(packageJsonContent),
  };
}

/**
 * Builds the docs site in production.
 */
export async function buildDocsSite() {
  cd(projectDir);
  await $`pnpm bazel build --config=snapshot-build //docs:build.production`;
  await $`rm -Rf docs/dist`;
  await $`mkdir -p docs/dist`;
  await $`cp -R dist/bin/docs/material-angular-io.production docs/dist`;
  await $`chmod -R u+w docs/dist/material-angular-io.production`;
}
