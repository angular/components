// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  googleAnalyticsOverallDomainId: 'G-Q8PB6PJ5CC', // Development framework property id.
  googleAnalyticsMaterialId: 'G-8DL3XGKYMC', // Development Material id

  legacyUniversalAnalyticsMainId: 'UA-8594346-26', // Legacy development id
  legacyUniversalAnalyticsMaterialId: '', // No legacy development id for Material

  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/fesm2015/zone-error';  // Included with Angular CLI.
