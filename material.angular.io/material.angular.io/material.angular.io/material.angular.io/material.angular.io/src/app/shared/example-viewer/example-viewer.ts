import {
  Component,
  Input,
  NgModuleFactory, OnInit, QueryList,
  Type,
  ViewChildren,
  ɵNgModuleFactory
} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';

import {EXAMPLE_COMPONENTS, LiveExample} from '@angular/components-examples';
import {CodeSnippet} from './code-snippet';

export type Views = 'snippet' | 'full' | 'demo';

/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

/** Preferred order for files of an example displayed in the viewer. */
const preferredExampleFileOrder = ['HTML', 'TS', 'CSS'];

@Component({
  selector: 'example-viewer',
  templateUrl: './example-viewer.html',
  styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer implements OnInit {
  @ViewChildren(CodeSnippet) readonly snippet: QueryList<CodeSnippet>;

  /** The tab to jump to when expanding from snippet view. */
  selectedTab: number = 0;

  /** Map of example files that should be displayed in the view-source tab in order. */
  exampleTabs: {[tabName: string]: string};

  /** Data for the currently selected example. */
  exampleData: LiveExample|null = null;

  /** URL to fetch code snippet for snippet view. */
  fileUrl: string;

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
  @Input() region?: string;

  /** Name of file to display in compact view. */
  @Input() file?: string;

  constructor(
    private readonly snackbar: MatSnackBar,
    private readonly clipboard: Clipboard) {}

  ngOnInit() {
    if (this.file) {
      this.fileUrl = this.generateUrl(this.file);
    }
  }

  /** Selects a given tab based on the example file of the compact view. */
  selectCorrectTab() {
    if (!this.file || !this.exampleTabs) {
      return;
    }

    const extension = this.file.substring(this.file.lastIndexOf('.') + 1);
    const exampleTabNames = this._getExampleTabNames();

    for (let i = 0; i < exampleTabNames.length; i++) {
      const tabName = exampleTabNames[i];
      if (tabName.toLowerCase() === extension || tabName.endsWith(`.${extension}`)) {
        this.selectedTab = i;
        return;
      }
    }

    console.error(`Could not find tab for file extension: "${extension}".`);
  }

  toggleCompactView() {
    if (this.view === 'snippet') {
      this.view = 'full';
      this.selectCorrectTab();
    } else {
      this.view = 'snippet';
    }
  }

  toggleSourceView(): void {
    this.view === 'full' ? this.view = 'demo' : this.view = 'full';
  }

  copySource(text: string) {
    if (this.clipboard.copy(text)) {
      this.snackbar.open('Code copied', '', {duration: 2500});
    } else {
      this.snackbar.open('Copy failed. Please try again!', '', {duration: 2500});
    }
  }

  generateUrl(file: string): string {
    const lastDotIndex = file.lastIndexOf('.');
    const contentBeforeDot = file.substring(0, lastDotIndex);
    const contentAfterDot = file.substring(lastDotIndex + 1);
    let fileName: string;

    if (this.region) {
      fileName = `${contentBeforeDot}_${this.region}-${contentAfterDot}.html`;
    } else {
      fileName = `${contentBeforeDot}-${contentAfterDot}.html`;
    }

    return this.exampleData ?
        `/docs-content/examples-highlighted/${this.exampleData.packagePath}/${fileName}` : '';
  }

  _getExampleTabNames() {
    return Object.keys(this.exampleTabs).sort((a, b) => {
      let indexA = preferredExampleFileOrder.indexOf(a);
      let indexB = preferredExampleFileOrder.indexOf(b);
      // Files which are not part of the preferred example file order should be
      // moved after all items with a preferred index.
      if (indexA === -1) indexA = preferredExampleFileOrder.length;
      if (indexB === -1) indexB = preferredExampleFileOrder.length;
      return (indexA - indexB) || 1;
    });
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
    this.exampleTabs = {};

    if (this.exampleData) {
      // Name of the default example files. If files with such name exist within the example,
      // we provide a shorthand for them within the example tabs (for less verbose tabs).
      const exampleBaseFileName = `${this.example}-example`;
      const docsContentPath = `/docs-content/examples-highlighted/${this.exampleData.packagePath}`;


      for (const fileName of this.exampleData.files) {
        // Since the additional files refer to the original file name, we need to transform
        // the file name to match the highlighted HTML file that displays the source.
        const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
        const importPath = `${docsContentPath}/${fileSourceName}`;

        if (fileName === `${exampleBaseFileName}.ts`) {
          this.exampleTabs['TS'] = importPath;
        } else if (fileName === `${exampleBaseFileName}.css`) {
          this.exampleTabs['CSS'] = importPath;
        } else if (fileName === `${exampleBaseFileName}.html`) {
          this.exampleTabs['HTML'] = importPath;
        } else {
          this.exampleTabs[fileName] = importPath;
        }
      }
    }
  }
}
