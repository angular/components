import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

describe('Token overrides migration', () => {
  async function setup(originalSource: string): Promise<string> {
    const themePath = 'projects/cdk-testing/theme.scss';
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v19',
      MIGRATION_PATH,
      [],
    );

    writeFile(themePath, originalSource);
    await runFixers();
    return appTree.readContent(themePath);
  }

  it('should update token names', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `@include mat.core-overrides((`,
        `  background-color: red,`,
        `));`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.core-overrides((`,
      `  app-background-color: red,`,
      `));`,
    ]);
  });

  it('should split ambiguous tokens into multiple assignments', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `@include mat.button-overrides((`,
        `  container-shape: 5px,`,
        `));`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.button-overrides((`,
      `  filled-container-shape: 5px,`,
      `  outlined-container-shape: 5px,`,
      `  protected-container-shape: 5px,`,
      `  text-container-shape: 5px,`,
      `));`,
    ]);
  });

  it('should update multiple token names', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `@include mat.core-overrides((`,
        `  background-color: red,`,
        `  label-text-color: blue`,
        `));`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.core-overrides((`,
      `  app-background-color: red,`,
      `  option-label-text-color: blue,`,
      `  optgroup-label-text-color: blue`,
      `));`,
    ]);
  });

  it('should work with single-line formatting', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `@include mat.button-overrides((container-color: green));`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.button-overrides((` +
        `filled-container-color: green, protected-container-color: green));`,
    ]);
  });
});
