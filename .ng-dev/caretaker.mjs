/**
 * The configuration for `ng-dev caretaker` commands.
 *
 * @type { import("@angular/ng-dev").CaretakerConfig }
 */
export const caretaker = {
  githubQueries: [
    {
      name: 'Merge Queue',
      query: `is:pr is:open status:success label:"action: merge"`,
    },
    {
      name: 'Merge Assistance Queue',
      query: `is:pr is:open label:"merge: caretaker note" label:"action: merge"`,
    },
    {
      name: 'Triage Queue',
      query: `is:open label:"needs triage"`,
    },
  ],
  g3SyncConfigPath: './.ng-dev/google-sync-config.json',
};
