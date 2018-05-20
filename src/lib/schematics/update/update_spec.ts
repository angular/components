import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {join} from 'path';
import {Tree} from '@angular-devkit/schematics';
import {createTestApp} from '../utils/testing';
import {getFileContent} from '@schematics/angular/utility/test';

const collectionPath = join(__dirname, '../collection.json');

describe('material-nav-schematic', () => {
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  it('should remove the temp directory', () => {
    const tree = runner.runSchematic('update', {}, createTestApp());
    const files = tree.files;

    let has = false;
    for (const file of files) {
      if (file.indexOf('angular_material_schematics-')) {
        has = true;
        break;
      }
    }

    expect(has).toBe(false);
  });

});