import {Component, Input, NgModuleFactory, Type, ɵNgModuleFactory} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

import {EXAMPLE_COMPONENTS, LiveExample} from '@angular/components-examples';
import {CopierService} from '../copier/copier.service';

/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

@Component({
  selector: 'example-viewer',
  templateUrl: './example-viewer.html',
  styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer {
  /** Map of example files that should be displayed in the view-source tab. */
  exampleTabs: {[tabName: string]: string};

  /** Data for the currently selected example. */
  exampleData: LiveExample;

  /** Whether the source for the example is being displayed. */
  showSource = false;

  /** Component type for the current example. */
  _exampleComponentType: Type<any>|null = null;

  /** Module factory that declares the example component. */
  _exampleModuleFactory: NgModuleFactory<any>|null = null;

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

  constructor(private snackbar: MatSnackBar, private copier: CopierService) {}

  toggleSourceView(): void {
    this.showSource = !this.showSource;
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

  private resolveHighlightedExampleFile(fileName: string) {
    return `/docs-content/examples-highlighted/${fileName}`;
  }

  private _generateExampleTabs() {
    this.exampleTabs = {
      HTML: this.resolveHighlightedExampleFile(`${this.example}-example-html.html`),
      TS: this.resolveHighlightedExampleFile(`${this.example}-example-ts.html`),
      CSS: this.resolveHighlightedExampleFile(`${this.example}-example-css.html`),
    };

    const additionalFiles = this.exampleData.additionalFiles || [];

    additionalFiles.forEach(fileName => {
      // Since the additional files refer to the original file name, we need to transform
      // the file name to match the highlighted HTML file that displays the source.
      const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
      this.exampleTabs[fileName] = this.resolveHighlightedExampleFile(fileSourceName);
    });
  }
}
