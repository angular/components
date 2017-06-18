import {TestBed, inject, async, flushMicrotasks, fakeAsync} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';
import {
  BaseRequestOptions, Http, HttpModule, Response, ResponseOptions,
  XHRBackend
} from '@angular/http';
import {PlunkerWriter} from './plunker-writer';
import {ExampleData} from '@angular/material-examples';


describe('PlunkerWriter', () => {
  let plunkerWriter: PlunkerWriter;
  let data: ExampleData;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      declarations: [],
      providers: [
        PlunkerWriter,
        BaseRequestOptions,
        MockBackend,
        {provide: XHRBackend, useExisting: MockBackend},
      ]
    }).compileComponents();
  }));

  beforeEach(inject([MockBackend], (mockBackend: MockBackend, http: Http) => {
    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      connection.mockRespond(getFakeDocResponse(url));
    });

    plunkerWriter = TestBed.get(PlunkerWriter);
    data = new ExampleData('');
    data.examplePath = 'http://material.angular.io/';
    data.exampleFiles = ['test.ts', 'test.html', 'src/detail.ts'];
  }));

  it('should append correct copyright', () => {
    expect(plunkerWriter._appendCopyright('test.ts', 'NoContent')).toBe(`NoContent

/**  Copyright 2017 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */`);

    expect(plunkerWriter._appendCopyright('test.html', 'NoContent')).toBe(`NoContent

<!-- Copyright 2017 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license -->`);

  });

  it('should create form element', () => {
    expect(plunkerWriter._createFormElement().outerHTML).toBe(
      `<form action="https://plnkr.co/edit/?p=preview" method="post" target="_blank"></form>`);
  });

  it('should add files to form input', () => {
    let form = plunkerWriter._createFormElement();

    plunkerWriter._addFileToForm(form, data, 'NoContent', 'test.ts', 'path/to/file');
    plunkerWriter._addFileToForm(form, data, 'Test', 'test.html', 'path/to/file');
    plunkerWriter._addFileToForm(form, data, 'Detail', 'src/detail.ts', 'path/to/file');

    expect(form.elements.length).toBe(3);
    expect(form.elements[0].getAttribute('name')).toBe('files[test.ts]');
    expect(form.elements[1].getAttribute('name')).toBe('files[test.html]');
    expect(form.elements[2].getAttribute('name')).toBe('files[src/detail.ts]');
  });

  it('should open a new window with plunker url', fakeAsync(() => {
    let form;
    plunkerWriter.constructPlunkerForm(data).then(result => form = result);
    flushMicrotasks();

    expect(form.elements.length).toBe(11);

    // Should have correct tags
    expect(form.elements[0].getAttribute('name')).toBe('tags[0]');
    expect(form.elements[0].getAttribute('value')).toBe('angular');
    expect(form.elements[1].getAttribute('value')).toBe('material');
    expect(form.elements[2].getAttribute('value')).toBe('example');

    // Should have private and description
    expect(form.elements[3].getAttribute('name')).toBe('private');
    expect(form.elements[4].getAttribute('name')).toBe('description');

    // Should have example files
    expect(form.elements[5].getAttribute('name')).toBe('files[index.html]');
    expect(form.elements[6].getAttribute('name')).toBe('files[systemjs.config.js]');
    expect(form.elements[7].getAttribute('name')).toBe('files[main.ts]');

    // Should have template files
    expect(form.elements[8].getAttribute('name')).toBe('files[test.ts]');
    expect(form.elements[9].getAttribute('name')).toBe('files[test.html]');
    expect(form.elements[10].getAttribute('name')).toBe('files[src/detail.ts]');

    // TODO(tinagao): Add more test
  }));
});

const FAKE_DOCS = {
  'http://material.angular.io/test.ts': 'ExampleComponent',
  'http://material.angular.io/test.html': `
      <example></example>`,
  'http://material.angular.io/src/detail.ts': 'DetailComponent',
};

function getFakeDocResponse(url: string) {
  if (url in FAKE_DOCS) {
    return new Response(new ResponseOptions({
      status: 200,
      body: FAKE_DOCS[url],
    }));
  } else {
    return new Response(new ResponseOptions({status: 404}));
  }
}
