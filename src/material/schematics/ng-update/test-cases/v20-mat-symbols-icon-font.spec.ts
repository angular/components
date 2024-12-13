import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

const INDEX_HTML_FILE_PATH = '/projects/cdk-testing/src/index.html';

describe('v20 material symbols icon font migration', () => {
  let tree: UnitTestTree;
  let writeFile: (filename: string, content: string) => void;
  let runMigration: () => Promise<unknown>;

  function stripWhitespace(content: string): string {
    return content.replace(/\s/g, '');
  }

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v20', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    writeFile = testSetup.writeFile;
    runMigration = testSetup.runFixers;
  });

  it('should add Material Symbols font to index html file', async () => {
    writeFile(
      INDEX_HTML_FILE_PATH,
      `
        <!doctype html>
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          </head>
          <body></body>
        </html>
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(INDEX_HTML_FILE_PATH))).toBe(
      stripWhitespace(`
        <!doctype html>
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
          </head>
          <body></body>
        </html>
    `),
    );
  });

  it('should not add Material Symbols font to index html file if it is already imported', async () => {
    writeFile(
      INDEX_HTML_FILE_PATH,
      `
        <!doctype html>
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
          </head>
          <body></body>
        </html>
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(INDEX_HTML_FILE_PATH))).toBe(
      stripWhitespace(`
        <!doctype html>
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet">
          </head>
          <body></body>
        </html>
    `),
    );
  });
});
