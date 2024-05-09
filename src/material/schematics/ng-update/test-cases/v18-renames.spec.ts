import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

describe('V18 token renames', () => {
  async function setup(fileName: string, originalSource: string): Promise<string> {
    const filePath = `projects/cdk-testing/src/${fileName}`;
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v18',
      MIGRATION_PATH,
      [],
    );

    if (fileName.endsWith('.html')) {
      writeFile(
        'projects/cdk-testing/src/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `@Component({selector: 'comp', templateUrl: '${fileName}'})`,
          `export class Comp {}`,
        ].join('\n'),
      );
    } else if (fileName.endsWith('.css') && fileName !== 'theme.css') {
      writeFile(
        'projects/cdk-testing/src/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `@Component({selector: 'comp', template: '', styleUrl: '${fileName}'})`,
          `export class Comp {}`,
        ].join('\n'),
      );
    }

    writeFile(filePath, originalSource);
    await runFixers();
    return appTree.readContent(filePath);
  }

  it('should migrate mdc-form-field tokens in theme css', async () => {
    const result = await setup(
      'theme.scss',
      [
        `body {`,
        `  --mdc-form-field-label-text-color: red;`,
        `  --mdc-form-field-label-text-font: Roboto;`,
        `  --mdc-form-field-label-text-size: 16px;`,
        `  --mdc-form-field-label-text-weight: bold;`,
        `  --mdc-form-field-label-text-tracking: 0;`,
        `  --mdc-form-field-label-text-line-height: 1.2;`,
        `  --mdc-form-field-label-text-color-custom: green;`,
        `}`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `body {`,
      `  --mat-checkbox-label-text-color: red;`,
      `  --mat-checkbox-label-text-font: Roboto;`,
      `  --mat-checkbox-label-text-size: 16px;`,
      `  --mat-checkbox-label-text-weight: bold;`,
      `  --mat-checkbox-label-text-tracking: 0;`,
      `  --mat-checkbox-label-text-line-height: 1.2;`,
      `  --mdc-form-field-label-text-color-custom: green;`,
      `}`,
    ]);
  });

  it('should migrate mdc-form-field tokens in component css', async () => {
    const result = await setup(
      'some-comp.css',
      `:host {color: var(--mdc-form-field-label-text-color);}`,
    );

    expect(result).toBe(`:host {color: var(--mat-checkbox-label-text-color);}`);
  });

  it('should migrate mdc-form-field tokens in ts', async () => {
    const result = await setup(
      'some-comp.ts',
      `const TEXT_COLOR_PROP = '--mdc-form-field-label-text-color';`,
    );

    expect(result).toBe(`const TEXT_COLOR_PROP = '--mat-checkbox-label-text-color';`);
  });

  it('should migrate mdc-form-field tokens in html', async () => {
    const result = await setup(
      'some-comp.html',
      `<div style="--mdc-form-field-label-text-color: red;"><ng-content /></div>`,
    );

    expect(result).toBe(`<div style="--mat-checkbox-label-text-color: red;"><ng-content /></div>`);
  });
});
