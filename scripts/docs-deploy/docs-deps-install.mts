import {$, cd} from 'zx';
import {resolveYarnScriptForProject} from '@angular/ng-dev';

export interface InstallOptions {
  /** Whether dependencies should be installed with the lockfile being frozen. */
  frozenLockfile: boolean;
}

/** Installs dependencies in the specified docs repository. */
export async function installDepsForDocsSite(
  repoDirPath: string,
  options: InstallOptions = {frozenLockfile: true},
) {
  const yarnBin = await resolveYarnScriptForProject(repoDirPath);
  const additionalArgs = [];

  if (options.frozenLockfile) {
    additionalArgs.push(yarnBin.legacy ? '--frozen-lock-file' : '--immutable');
  } else if (!yarnBin.legacy) {
    additionalArgs.push('--no-immutable');
  }

  await $`${yarnBin.binary} ${yarnBin.args} --cwd ${repoDirPath} install ${additionalArgs.join(' ')}`;
}
