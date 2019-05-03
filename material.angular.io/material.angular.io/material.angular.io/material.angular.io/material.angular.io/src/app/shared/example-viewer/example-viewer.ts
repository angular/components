import {Component, Input} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ComponentPortal} from '@angular/cdk/portal';

import {EXAMPLE_COMPONENTS, LiveExample} from '@angular/material-examples';
import {CopierService} from '../copier/copier.service';

/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

@Component({
  selector: 'example-viewer',
  templateUrl: './example-viewer.html',
  styleUrls: ['./example-viewer.scss']
})
export class ExampleViewer {
  /** Component portal for the currently displayed example. */
  selectedPortal: ComponentPortal<any>;

  /** Map of example files that should be displayed in the view-source tab. */
  exampleTabs: {[tabName: string]: string};

  /** Data for the currently selected example. */
  exampleData: LiveExample;

  /** Whether the source for the example is being displayed. */
  showSource = false;

  /** String key of the currently displayed example. */
  @Input()
  get example() { return this._example; }
  set example(exampleName: string) {
    if (exampleName && EXAMPLE_COMPONENTS[exampleName]) {
      this._example = exampleName;
      this.exampleData = EXAMPLE_COMPONENTS[exampleName];
      this.selectedPortal = new ComponentPortal(this.exampleData.component);
      this._generateExampleTabs();
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
