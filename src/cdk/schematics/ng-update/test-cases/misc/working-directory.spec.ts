import {join} from 'path';
import {MIGRATION_PATH} from '../../../index.spec';
import {createTestCaseSetup} from '../../../testing';

describe('ng-update working directory', () => {

  it('should migrate project if working directory is not workspace root', async () => {
    const {runFixers, writeFile, removeTempDir, tempPath, appTree} = await createTestCaseSetup(
      'migration-v6', MIGRATION_PATH, []);
    const stylesheetPath = 'projects/cdk-testing/src/test-cases/global-stylesheets-test.scss';

    // Write a stylesheet that will be captured by the migration.
    writeFile(stylesheetPath, `
      [cdkPortalHost] {
        color: red;
      }
    `);

    // We want to switch into a given project directory. This means that the devkit
    // file system tree is at workspace root while the working directory is not the
    // workspace directory as previously assumed. See the following issue for more details:
    // https://github.com/angular/components/issues/19779
    await runFixers(join(tempPath, 'projects/cdk-testing'));

    expect(appTree.readContent(stylesheetPath)).not
      .toContain('[cdkPortalHost]', 'Expected migration to change stylesheet contents.');

    removeTempDir();
  });
});
