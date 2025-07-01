import {DocsMarkdownRenderer} from './docs-marked-renderer.mjs';
import * as marked from 'marked';

describe('DocsMarkdownRenderer', () => {
  let renderer: DocsMarkdownRenderer;
  beforeEach(() => {
    renderer = new DocsMarkdownRenderer();
  });

  function transform(markdown: string): string {
    marked.setOptions({renderer});

    return renderer.finalizeOutput(marked.parse(markdown, {async: false}), 'test.html');
  }

  it('generates regular headings for h1 and h2', () => {
    expect(transform('# a')).toContain('<h1>a</h1>');
    expect(transform('## b')).toContain('<h2 ');
  });

  it('creates header link for h3 and h4 headings', () => {
    expectEqualIgnoreLeadingWhitespace(
      transform('### header 3'),
      `
        <div class="docs-markdown">
          <h3 id="header-3" class="docs-header-link">
            <span header-link="header-3"></span>
            header 3
          </h3>
        </div>
      `,
    );
    expectEqualIgnoreLeadingWhitespace(
      transform('#### header 4'),
      `
        <div class="docs-markdown">
          <h4 id="header-4" class="docs-header-link">
            <span header-link="header-4"></span>
            header 4
          </h4>
        </div>
      `,
    );
  });

  it('generates links', () => {
    expect(transform('[some text](something "some title")')).toContain(
      '<a href="guide/something" title="some title">some text</a>',
    );
    expect(transform('[some text](#some-hash "some title")\n ### some hash')).toContain(
      '<a href="#some-hash" title="some title">some text</a>',
    );
    expect(transform('[some text](https://google.com)')).toContain(
      '<a href="https://google.com">some text</a>',
    );
  });

  it('generates html using new API', () => {
    const result = transform(`<!-- example(
         {
          "example": "exampleName",
          "file": "example-html.html",
          "region": "some-region"
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(
      result,
      '<div class="docs-markdown"></div><div material-docs-example="exampleName"\n' +
        'file="example-html.html"\n' +
        'region="some-region"></div><div class="docs-markdown"></div>',
    );
  });

  it('generates html using new API with no region', () => {
    const result = transform(`<!-- example(
         {
          "example": "exampleName",
          "file": "example-html.html"
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(
      result,
      '<div class="docs-markdown"></div><div material-docs-example="exampleName"\n' +
        'file="example-html.html"\n' +
        '></div><div class="docs-markdown"></div>',
    );
  });

  it('generates html using new API with no file and no region', () => {
    const result = transform(`<!-- example(
         {
          "example": "exampleName"
         }
        ) -->`);
    expectEqualIgnoreLeadingWhitespace(
      result,
      '<div class="docs-markdown"></div>' +
        '<div material-docs-example="exampleName"\n></div>' +
        '<div class="docs-markdown"></div>',
    );
  });

  it('generates html using old API', () => {
    expect(transform('<!-- example(name) -->')).toEqual(
      '<div class="docs-markdown"></div>' +
        '<div material-docs-example="name"></div>' +
        '<div class="docs-markdown"></div>',
    );
  });

  it('does not allow id links with no matching id element', () => {
    spyOn(console, 'error');
    spyOn(process, 'exit');
    transform('[text](#does-not-exist)');
    expect((console.error as jasmine.Spy).calls.allArgs()).toEqual([
      [jasmine.stringMatching(/Could not process file: test\.html/)],
      [jasmine.stringMatching(/Found link to "does-not-exist"\. This heading does not exist/)],
    ]);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  function expectEqualIgnoreLeadingWhitespace(actual: string, expected: string) {
    expect(stripLeadingWhitespace(actual.trim())).toEqual(stripLeadingWhitespace(expected.trim()));
  }

  function stripLeadingWhitespace(s: string) {
    return s.replace(/^\s*/gm, '');
  }
});
