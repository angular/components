import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('v19 migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v19', {}, tree);
  }

  function stripWhitespace(value: string) {
    return value.replace(/\s/g, '');
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migration.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    tmpDirPath = getSystemPath(host.root);
    shx.cd(tmpDirPath);
  });

  it('should migrate the clusterer in HTML files', async () => {
    writeFile(
      '/my-comp.html',
      `
        <section>
          <map-marker-clusterer>
            <map-marker/>
            <map-marker/>
            <map-marker/>
          </map-marker-clusterer>
        </section>

        <main>
          <div>
            <map-marker-clusterer some-attr>
              @for (marker of markers; track $index) {
                <map-marker/>
              }
            </map-marker-clusterer>
          </div>
        </main>
      `,
    );

    await runMigration();

    const content = tree.readContent('/my-comp.html');

    expect(stripWhitespace(content)).toBe(
      stripWhitespace(`
        <section>
          <deprecated-map-marker-clusterer>
            <map-marker/>
            <map-marker/>
            <map-marker/>
          </deprecated-map-marker-clusterer>
        </section>

        <main>
          <div>
            <deprecated-map-marker-clusterer some-attr>
              @for (marker of markers; track $index) {
                <map-marker/>
              }
            </deprecated-map-marker-clusterer>
          </div>
        </main>
    `),
    );
  });

  it('should migrate the clusterer in a TypeScript file', async () => {
    writeFile(
      '/my-comp.ts',
      `
        import {Component} from '@angular/core';
        import {MapMarkerClusterer, MapMarker} from '@angular/google-maps';

        @Component({
          template: '<map-marker-clusterer><map-marker/></map-marker-clusterer>',
          imports: [MapMarkerClusterer, MapMarker]
        })
        export class MyComp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/my-comp.ts');

    expect(stripWhitespace(content)).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {DeprecatedMapMarkerClusterer as MapMarkerClusterer, MapMarker} from '@angular/google-maps';

        @Component({
          template: '<deprecated-map-marker-clusterer><map-marker/></deprecated-map-marker-clusterer>',
          imports: [MapMarkerClusterer, MapMarker]
        })
        export class MyComp {}
      `),
    );
  });

  it('should migrate an aliased clusterer in a TypeScript file', async () => {
    writeFile(
      '/my-comp.ts',
      `
        import {Component} from '@angular/core';
        import {MapMarkerClusterer as MyClusterer, MapMarker} from '@angular/google-maps';

        @Component({
          template: '<map-marker-clusterer><map-marker/></map-marker-clusterer>',
          imports: [MyClusterer, MapMarker]
        })
        export class MyComp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/my-comp.ts');

    expect(stripWhitespace(content)).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {DeprecatedMapMarkerClusterer as MyClusterer, MapMarker} from '@angular/google-maps';

        @Component({
          template: '<deprecated-map-marker-clusterer><map-marker/></deprecated-map-marker-clusterer>',
          imports: [MyClusterer, MapMarker]
        })
        export class MyComp {}
      `),
    );
  });

  it('should migrate a re-exported clusterer', async () => {
    writeFile(
      '/index.ts',
      `
        export {MapMarkerClusterer} from '@angular/google-maps';
        export {MapMarkerClusterer as AliasedMapMarkerClusterer} from '@angular/google-maps';
      `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');

    expect(stripWhitespace(content)).toBe(
      stripWhitespace(`
        export {DeprecatedMapMarkerClusterer as MapMarkerClusterer} from '@angular/google-maps';
        export {DeprecatedMapMarkerClusterer as AliasedMapMarkerClusterer} from '@angular/google-maps';
      `),
    );
  });

  it('should not migrate an import outside of the Angular module', async () => {
    writeFile(
      '/my-comp.ts',
      `
        import {Component} from '@angular/core';
        import {MapMarkerClusterer} from '@not-angular/google-maps';

        @Component({
          template: '',
          imports: [MapMarkerClusterer]
        })
        export class MyComp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/my-comp.ts');

    expect(stripWhitespace(content)).toBe(
      stripWhitespace(`
        import {Component} from '@angular/core';
        import {MapMarkerClusterer} from '@not-angular/google-maps';

        @Component({
          template: '',
          imports: [MapMarkerClusterer]
        })
        export class MyComp {}
      `),
    );
  });
});
