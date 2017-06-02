/** Interface for the build config. */
export interface BuildConfig {
  projectVersion: string;
  projectDir: string;
  packagesDir: string;
  outputDir: string;
  licenseBanner: string;
}

/** Build config being used to build package output. */
export let buildConfig: BuildConfig;

/** Configures the build by setting the build config. */
export function configureBuild(config: BuildConfig) {
  buildConfig = config;
}

