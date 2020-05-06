import {
  Component,
  Input,
  NgModuleFactory, QueryList,
  Type,
  ViewChildren,
  ɵNgModuleFactory
} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

import {EXAMPLE_COMPONENTS, LiveExample} from '@angular/components-examples';
import {CopierService} from '../copier/copier.service';
import {CodeSnippet} from './code-snippet';

export type Views = 'compact' | 'full' | 'collapsed';

/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

@Component({
  selector: 'example-viewer',
  templateUrl: './example-viewer.html',
  styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer {
  @ViewChildren(CodeSnippet) readonly snippet: QueryList<CodeSnippet>;

  /** Map of example files that should be displayed in the view-source tab. */
  exampleTabs: {[tabName: string]: string};

  /** Data for the currently selected example. */
  exampleData: LiveExample;

  /** Component type for the current example. */
  _exampleComponentType: Type<any>|null = null;

  /** Module factory that declares the example component. */
  _exampleModuleFactory: NgModuleFactory<any>|null = null;

  /** View of the example component. */
  @Input() view: Views;

  /** Whether to show toggle for compact view. */
  @Input() showCompactToggle = false;

  /** String key of the currently displayed example. */
  @Input()
  get example() { return this._example; }
  set example(exampleName: string) {
    if (exampleName && exampleName !== this._example && EXAMPLE_COMPONENTS[exampleName]) {
      this._example = exampleName;
      this.exampleData = EXAMPLE_COMPONENTS[exampleName];
      this._generateExampleTabs();
      this._loadExampleComponent();
    } else {
      console.error(`Could not find example: ${exampleName}`);
    }
  }
  private _example: string;

  /** Range of lines of the source code to display in compact view. */
  @Input() lines: readonly [number, number];

  /** Name of file to display in compact view. */
  @Input() file: string;

  constructor(private readonly snackbar: MatSnackBar, private readonly copier: CopierService) {
  }

  toggleCompactView() {
    this.view === 'compact' ? this.view = 'full' : this.view = 'compact';
  }

  toggleSourceView(): void {
    this.view === 'full' ? this.view = 'collapsed' : this.view = 'full';
  }

  copySource(text: string) {
    if (this.copier.copyText(text)) {
      this.snackbar.open('Code copied', '', {duration: 2500});
    } else {
      this.snackbar.open('Copy failed. Please try again!', '', {duration: 2500});
    }
  }

  _getExampleTabNames() {
    return Object.keys(this.exampleTabs);
  }

  /** Loads the component and module factory for the currently selected example. */
  private async _loadExampleComponent() {
    const {componentName, module} = EXAMPLE_COMPONENTS[this._example];
    // Lazily loads the example package that contains the requested example. Webpack needs to be
    // able to statically determine possible imports for proper chunk generation. Explicitly
    // specifying the path to the `fesm2015` folder as first segment instructs Webpack to generate
    // chunks for each example flat esm2015 bundle. To avoid generating unnecessary chunks for
    // source maps (which would never be loaded), we instruct Webpack to exclude source map
    // files. More details: https://webpack.js.org/api/module-methods/#magic-comments.
    const moduleExports: any = await import(
      /* webpackExclude: /\.map$/ */
      '@angular/components-examples/fesm2015/' + module.importSpecifier);
    this._exampleComponentType = moduleExports[componentName];
    // The components examples package is built with Ivy. This means that no factory files are
    // generated. To retrieve the factory of the AOT compiled module, we simply pass the module
    // class symbol to Ivy's module factory constructor. There is no equivalent for View Engine,
    // where factories are stored in separate files. Hence the API is currently Ivy-only.
    this._exampleModuleFactory = new ɵNgModuleFactory(moduleExports[module.name]);
  }

  private _generateExampleTabs() {
    const examplePath = `${this.exampleData.module.importSpecifier}/${this.example}`;
    const docsContentPath = `/docs-content/examples-highlighted/${examplePath}`;

    this.exampleTabs = {
      HTML: `${docsContentPath}/${this.example}-example-html.html`,
      TS: `${docsContentPath}/${this.example}-example-ts.html`,
      CSS: `${docsContentPath}/${this.example}-example-css.html`,
    };

    const additionalFiles = this.exampleData.additionalFiles || [];

    additionalFiles.forEach(fileName => {
      // Since the additional files refer to the original file name, we need to transform
      // the file name to match the highlighted HTML file that displays the source.
      const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
      this.exampleTabs[fileName] = `${docsContentPath}/${fileSourceName}`;
    });
  }
}
