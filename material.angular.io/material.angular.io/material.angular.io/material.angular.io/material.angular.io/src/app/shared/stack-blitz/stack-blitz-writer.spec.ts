import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {waitForAsync, fakeAsync, flushMicrotasks, inject, TestBed} from '@angular/core/testing';
import {EXAMPLE_COMPONENTS, ExampleData, LiveExample} from '@angular/components-examples';
import {StackBlitzWriter, TEMPLATE_FILES} from './stack-blitz-writer';
import stackblitz from '@stackblitz/sdk';

const testExampleId = 'my-test-example-id';
const testExampleBasePath = `/docs-content/examples-source/cdk/my-comp/${testExampleId}`;

const FAKE_DOCS: {[key: string]: string} = {
  /* eslint-disable @typescript-eslint/naming-convention */
  '/assets/stack-blitz/src/index.html': '<material-docs-example></material-docs-example>',
  '/assets/stack-blitz/src/app/app.module.ts':
      `import {MaterialDocsExample} from './material-docs-example';`,
  /* eslint-enable @typescript-eslint/naming-convention */
  [`${testExampleBasePath}/test.ts`]: 'ExampleComponent',
  [`${testExampleBasePath}/test.html`]: `<example></example>`,
  [`${testExampleBasePath}/src/detail.ts`]: 'DetailComponent',
};

const TEST_URLS = TEMPLATE_FILES.map(filePath => `/assets/stack-blitz/${filePath}`).concat([
  `${testExampleBasePath}/test.ts`,
  `${testExampleBasePath}/test.html`,
  `${testExampleBasePath}/src/detail.ts`,
]);

describe('StackBlitzWriter', () => {
  let stackBlitzWriter: StackBlitzWriter;
  let data: ExampleData;
  let http: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        StackBlitzWriter,
      ]
    }).compileComponents();
  }));

  beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
    http = h;
  }));

  beforeEach(() => {
    stackBlitzWriter = TestBed.inject(StackBlitzWriter);
    data = new ExampleData('');
    data.selectorName = 'this-is-the-comp-name';
    data.componentNames = ['ExampleComponent', 'AdditionalComp'];
    data.exampleFiles = ['test.ts', 'test.html', 'src/detail.ts'];
    data.indexFilename = data.exampleFiles[0];

    // Fake the example in the `EXAMPLE_COMPONENTS`. The stack blitz writer relies on
    // module information for the example in order to read the example sources from disk.
    EXAMPLE_COMPONENTS[testExampleId] = {module: {importSpecifier: 'cdk/my-comp'}} as LiveExample;
  });

  afterEach(() => {
    delete EXAMPLE_COMPONENTS[testExampleId];
  });

  function fakeExternalFileRequests() {
    for (const url of TEST_URLS) {
      http.expectOne(url).flush(FAKE_DOCS[url] || 'fake');
    }
  }

  it('should append correct copyright', () => {
    const year = new Date().getFullYear();
    expect(stackBlitzWriter._appendCopyright('test.ts', 'NoContent')).toBe(`NoContent

/**  Copyright ${year} Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */`);

    expect(stackBlitzWriter._appendCopyright('test.html', 'NoContent')).toBe(`NoContent

<!-- Copyright ${year} Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license -->`);

  });

  it('should set tags for example stackblitz', fakeAsync(() => {
    const openProjectSpy = spyOn(stackblitz, 'openProject');

    stackBlitzWriter
      .createStackBlitzForExample(testExampleId, data, false)
      .then(openBlitzFn => openBlitzFn());

    flushMicrotasks();
    fakeExternalFileRequests();
    flushMicrotasks();

    expect(openProjectSpy).toHaveBeenCalledTimes(1);
    expect(openProjectSpy).toHaveBeenCalledWith(jasmine.objectContaining(
        {tags: ['angular', 'material', 'cdk', 'web', 'example']}), jasmine.anything());
  }));

  it('should read and transform template files properly', fakeAsync(() => {
    const openProjectSpy = spyOn(stackblitz, 'openProject');

    stackBlitzWriter
      .createStackBlitzForExample(testExampleId, data, false)
      .then(openBlitzFn => openBlitzFn());

    flushMicrotasks();
    fakeExternalFileRequests();
    flushMicrotasks();

    const expectedFiles = jasmine.objectContaining({
      /* eslint-disable @typescript-eslint/naming-convention */
      'angular.json': 'fake',
      'src/main.ts': 'fake',
      'src/test.ts': 'fake',
      'src/index.html': `<this-is-the-comp-name></this-is-the-comp-name>`,
      'src/app/app.module.ts': `import {ExampleComponent, AdditionalComp} from './test';`,
      'src/app/test.ts': `ExampleComponent

/**  Copyright ${new Date().getFullYear()} Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */`,
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    expect(openProjectSpy).toHaveBeenCalledTimes(1);
    expect(openProjectSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({files: expectedFiles}), {openFile: 'src/app/test.ts'});
  }));
});
