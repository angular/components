import {renderFile} from 'pug';
import {join} from 'path';
import {existsSync} from 'fs';

// These imports lack type definitions.
const marked = require('marked');

/**
 * Custom Dgeni template engine that adds support for Pug template files. By default, Nunjucks
 * can be installed from the dgeni-packages, but Nunjucks is not specifically for HTML output,
 * and therefore leads to unreadable, confusing and unstructured template files.
 */
export class PugTemplateEngine {

  /** Global functions that should be passed to every Pug template. */
  private _globalFunctions = {
    marked: (input: string | null) => marked(input || '')
  };

  constructor(private templateFinder: any) {}

  /** Function that is being called by the render-docs processor of Dgeni. */
  getRenderer() {
    return (file: string, data: any) => {
      const templatePath = this._findTemplatePath(file);

      if (!templatePath) {
        throw `Error: Could not find path for template: "${templatePath}".`;
      }

      return renderFile(templatePath, {...data, ...this._globalFunctions});
    };
  }

  /** Finds the given template by using the templateFinder service. */
  private _findTemplatePath(templateName: string): string | undefined {
    for (const templateFolder of this.templateFinder.templateFolders) {
      const templatePath = join(templateFolder, templateName);

      if (existsSync(templatePath)) {
        return templatePath;
      }
    }
  }
}
