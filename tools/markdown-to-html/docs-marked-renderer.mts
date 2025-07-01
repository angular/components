import {Renderer, Tokens} from 'marked';
import {basename, extname} from 'path';
import slugify from 'slugify';
import {highlightCodeBlock} from '../highlight-files/highlight-code-block.mjs';

/** Regular expression that matches example comments. */
const exampleCommentRegex = /<!--\s*example\(\s*([^)]+)\)\s*-->/g;

/** Marker inserted before the start of an example. */
const exampleStartMarker = '<!-- ___exampleStart___ -->';

/** Marker inserted after the end of an example. */
const exampleEndMarker = '<!-- ___exampleEnd___ -->';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular Material docs.
 */
export class DocsMarkdownRenderer extends Renderer {
  /** Set of fragment links discovered in the currently rendered file. */
  private _referencedFragments = new Set<string>();

  /** IDs that have been generated during Markdown parsing. */
  private _seenIds = new Set<string>();

  /**
   * Transforms a markdown heading into the corresponding HTML output. In our case, we
   * want to create a header-link for each H2, H3, and H4 heading. This allows users to jump to
   * specific parts of the docs.
   */
  heading(tag: Tokens.Heading) {
    const depth = tag.depth;
    const content = this.parser.parseInline(tag.tokens);

    if (depth === 2 || depth === 3 || depth === 4 || depth === 5 || depth === 6) {
      const headingId = slugify.default(tag.text, {lower: true, strict: true});

      this._seenIds.add(headingId);
      return `
        <h${depth} id="${headingId}" class="docs-header-link">
          <span header-link="${headingId}"></span>
          ${content}
        </h${depth}>
      `;
    }

    return `<h${depth}>${content}</h${depth}>`;
  }

  /** Transforms markdown links into the corresponding HTML output. */
  link(link: Tokens.Link) {
    const {href} = link;

    // We only want to fix up markdown links that are relative and do not refer to guides already.
    // Otherwise we always map the link to the "guide/" path.
    // TODO(devversion): remove this logic and just disallow relative paths.
    if (!href.startsWith('http') && !href.startsWith('#') && !href.includes('guide/')) {
      return super.link({
        ...link,
        href: `guide/${basename(href, extname(href))}`,
      });
    }

    // Keep track of all fragments discovered in a file.
    if (href.startsWith('#')) {
      this._referencedFragments.add(href.slice(1));
    }

    return super.link(link);
  }

  /**
   * Method that will be called whenever inline HTML is processed by marked. In that case,
   * we can easily transform the example comments into real HTML elements.
   * For example:
   * (New API)
   * `<!-- example(
   *   {
   *    "example": "exampleName",
   *    "file": "example-html.html",
   *    "region": "some-region"
   *   }
   *  ) -->`
   *  turns into
   *  `<div material-docs-example="exampleName"
   *        file="example-html.html"
   *        region="some-region"></div>`
   *
   *  (old API)
   *  `<!-- example(name) -->`
   *  turns into
   *  `<div material-docs-example="name"></div>`
   */
  html(content: Tokens.HTML | Tokens.Tag) {
    return content.raw.replace(exampleCommentRegex, (_match: string, content: string) => {
      let replacement: string;

      // using [\s\S]* because .* does not match line breaks
      if (content.match(/\{[\s\S]*\}/g)) {
        const {example, file, region} = JSON.parse(content.trim()) as {
          example: string;
          file: string;
          region: string;
        };
        replacement = `<div material-docs-example="${example}"
                             ${file ? `file="${file}"` : ''}
                             ${region ? `region="${region}"` : ''}></div>`;
      } else {
        replacement = `<div material-docs-example="${content}"></div>`;
      }

      return `${exampleStartMarker}${replacement}${exampleEndMarker}`;
    });
  }

  code(block: Tokens.Code): string {
    const langClass = block.lang ? ` class="language-${block.lang}"` : '';
    return `<pre><code${langClass}>${highlightCodeBlock(block.text, block.lang)}</code></pre>`;
  }

  /**
   * Method that will be called after a markdown file has been transformed to HTML. This method
   * can be used to finalize the content (e.g. by adding an additional wrapper HTML element)
   */
  finalizeOutput(output: string, fileName: string): string {
    const failures: string[] = [];

    // Collect any fragment links that do not resolve to existing fragments in the
    // rendered file. We want to error for broken fragment links.
    this._referencedFragments.forEach(id => {
      if (!this._seenIds.has(id)) {
        failures.push(`Found link to "${id}". This heading does not exist.`);
      }
    });

    if (failures.length) {
      console.error(`Could not process file: ${fileName}. Please fix the following errors:`);
      failures.forEach(message => console.error(`  -  ${message}`));
      process.exit(1);
    }

    this._seenIds.clear();
    this._referencedFragments.clear();

    const markdownOpen = '<div class="docs-markdown">';

    // The markdown styling can interfere with the example's styles, because we don't use
    // encapsulation. We work around it by replacing the opening marker, left by the previous
    // step, with a closing tag, and replacing the closing marker with an opening tag.
    // The result is that we exclude the example code from the markdown styling.
    output = output
      .replace(new RegExp(exampleStartMarker, 'g'), '</div>')
      .replace(new RegExp(exampleEndMarker, 'g'), markdownOpen);

    return `${markdownOpen}${output}</div>`;
  }
}
