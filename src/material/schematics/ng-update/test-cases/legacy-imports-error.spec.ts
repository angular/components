import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {logging} from '@angular-devkit/core';
import {MIGRATION_PATH} from '../../paths';

describe('legacy imports error', () => {
  const PATH = 'projects/material-testing/';
  let runFixers: () => Promise<unknown>;
  let tree: UnitTestTree;
  let writeFile: (path: string, content: string) => void;
  let fatalLogs: string[];

  beforeEach(async () => {
    const setup = await createTestCaseSetup('migration-v17', MIGRATION_PATH, []);
    runFixers = setup.runFixers;
    writeFile = setup.writeFile;
    tree = setup.appTree;
    fatalLogs = [];
    setup.runner.logger.subscribe((entry: logging.LogEntry) => {
      if (entry.level === 'fatal') {
        fatalLogs.push(entry.message);
      }
    });
  });

  afterEach(() => {
    runFixers = tree = writeFile = fatalLogs = null!;
  });

  it('should log a fatal message if the app imports a legacy import', async () => {
    writeFile(
      `${PATH}/src/app/app.module.ts`,
      `
      import {NgModule} from '@angular/core';
      import {MatLegacyButtonModule} from '@angular/material/legacy-button';

      @NgModule({
        imports: [MatLegacyButtonModule],
      })
      export class AppModule {}
    `,
    );

    await runFixers();

    expect(fatalLogs.length).toBe(1);
    expect(fatalLogs[0]).toContain(
      'Cannot update to Angular Material v17, ' +
        'because the project is using the legacy Material components',
    );
  });

  it('should downgrade the app to v16 if it contains legacy imports', async () => {
    writeFile(
      `${PATH}/package.json`,
      `{
        "name": "test",
        "version": "0.0.0",
        "dependencies": {
          "@angular/material": "^17.0.0"
        }
      }`,
    );

    writeFile(
      `${PATH}/src/app/app.module.ts`,
      `
      import {NgModule} from '@angular/core';
      import {MatLegacyButtonModule} from '@angular/material/legacy-button';

      @NgModule({
        imports: [MatLegacyButtonModule],
      })
      export class AppModule {}
    `,
    );

    await runFixers();

    const content = JSON.parse(tree.readText('/package.json')) as Record<string, any>;
    expect(content['dependencies']['@angular/material']).toBe('^16.2.0');
  });
});
