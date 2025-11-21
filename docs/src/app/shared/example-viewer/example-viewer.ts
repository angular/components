/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  model,
  signal,
  Type,
  viewChildren,
} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';

import {type LiveExample, loadExample} from '@angular/components-examples';
import {CodeSnippet} from './code-snippet';
import {normalizePath} from '../normalize-path';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {StackblitzButton} from '../stackblitz/stackblitz-button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import {NgComponentOutlet} from '@angular/common';
import {DocumentationItems} from '../documentation-items/documentation-items';

export type Views = 'snippet' | 'full' | 'demo';

/** Regular expression that matches a file name and its extension */
const fileExtensionRegex = /(.*)\.(\w+)/;

/** Preferred order for files of an example displayed in the viewer. */
const preferredExampleFileOrder = ['HTML', 'TS', 'CSS'];

@Component({
  selector: 'example-viewer',
  templateUrl: './example-viewer.html',
  styleUrls: ['./example-viewer.scss'],
  imports: [
    MatIconButton,
    MatTooltip,
    MatIcon,
    StackblitzButton,
    MatTabGroup,
    MatTab,
    CodeSnippet,
    NgComponentOutlet,
  ],
  host: {
    '[attr.id]': 'example',
  },
})
export class ExampleViewer {
  private readonly _snackbar = inject(MatSnackBar);
  private readonly _clipboard = inject(Clipboard);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _docsItems = inject(DocumentationItems);
  readonly snippet = viewChildren(CodeSnippet);

  /** The tab to jump to when expanding from snippet view. */
  readonly selectedTab = signal(0);

  /** Map of example files that should be displayed in the view-source tab in order. */
  readonly exampleTabs = signal<Record<string, string>>({});

  /** Data for the currently selected example. */
  readonly exampleData = signal<LiveExample | null>(null);

  /** URL to fetch code snippet for snippet view. */
  readonly fileUrl = computed(() => {
    const file = this.file();
    const exampleData = this.exampleData();
    const region = this.region();

    if (!file) {
      return undefined;
    }

    const lastDotIndex = file.lastIndexOf('.');
    const contentBeforeDot = file.substring(0, lastDotIndex);
    const contentAfterDot = file.substring(lastDotIndex + 1);
    let fileName: string;

    if (region) {
      fileName = `${contentBeforeDot}_${region}-${contentAfterDot}.html`;
    } else {
      fileName = `${contentBeforeDot}-${contentAfterDot}.html`;
    }

    return exampleData
      ? `/docs-content/examples-highlighted/${exampleData.packagePath}/${fileName}`
      : '';
  });

  /** Component type for the current example. */
  readonly _exampleComponentType = signal<Type<any> | null>(null);

  /** View of the example component. */
  readonly view = model<Views>();

  /** Whether to show toggle for compact view. */
  readonly showCompactToggle = model(false);

  /** String key of the currently displayed example. */
  @Input()
  get example() {
    return this._example;
  }
  set example(exampleName: string | undefined) {
    if (exampleName && exampleName !== this._example) {
      this._example = exampleName;
      this._exampleChanged(exampleName);
    }
  }
  private _example: string | undefined;

  /** Range of lines of the source code to display in compact view. */
  readonly region = signal<string | undefined>(undefined);

  /** Name of file to display in compact view. */
  readonly file = model<string | undefined>();

  /** Selects a given tab based on the example file of the compact view. */
  selectCorrectTab() {
    const file = this.file();
    const exampleTabNames = this._exampleTabNames();

    if (!file || !exampleTabNames.length) {
      return;
    }

    const extension = file.substring(file.lastIndexOf('.') + 1);

    for (let i = 0; i < exampleTabNames.length; i++) {
      const tabName = exampleTabNames[i];
      if (tabName.toLowerCase() === extension || tabName.endsWith(`.${extension}`)) {
        this.selectedTab.set(i);
        return;
      }
    }

    console.error(`Could not find tab for file extension: "${extension}".`);
  }

  toggleCompactView() {
    if (this.view() === 'snippet') {
      this.view.set('full');
      this.selectCorrectTab();
    } else {
      this.view.set('snippet');
    }
  }

  toggleSourceView(): void {
    this.view.set(this.view() === 'full' ? 'demo' : 'full');
  }

  copySource(snippets: readonly CodeSnippet[], selectedIndex: number = 0) {
    const text = snippets[selectedIndex].viewer().textContent || '';
    if (this._clipboard.copy(text)) {
      this._snackbar.open('Code copied', '', {duration: 2500});
    } else {
      this._snackbar.open('Copy failed. Please try again!', '', {duration: 2500});
    }
  }

  protected _exampleTabNames = computed(() => {
    const exampleTabs = this.exampleTabs();

    if (!exampleTabs) {
      return [];
    }

    return Object.keys(exampleTabs).sort((a, b) => {
      let indexA = preferredExampleFileOrder.indexOf(a);
      let indexB = preferredExampleFileOrder.indexOf(b);
      // Files which are not part of the preferred example file order should be
      // moved after all items with a preferred index.
      if (indexA === -1) {
        indexA = preferredExampleFileOrder.length;
      }

      if (indexB === -1) {
        indexB = preferredExampleFileOrder.length;
      }

      return indexA - indexB || 1;
    });
  });

  _copyLink() {
    // Reconstruct the URL using `origin + pathname` so we drop any pre-existing hash.
    const fullUrl = location.origin + location.pathname + '#' + this._example;
    const copySuccessful = this._clipboard.copy(fullUrl);

    this._snackbar.open(
      copySuccessful ? 'Link copied' : 'Link copy failed. Please try again!',
      '',
      {duration: 2500},
    );
  }

  private async _exampleChanged(name: string) {
    const examples = (await this._docsItems.getData()).examples;
    this.exampleData.set(examples[name]);

    if (!this.exampleData()) {
      console.error(`Could not find example: ${name}`);
      return;
    }

    try {
      this._generateExampleTabs(this.exampleData());

      // Lazily loads the example package that contains the requested example.
      const moduleExports = await loadExample(name);
      this._exampleComponentType.set(moduleExports[examples[name].componentName]);

      // Since the data is loaded asynchronously, we can't count on the native behavior
      // that scrolls the element into view automatically. We do it ourselves while giving
      // the page some time to render.
      if (typeof location !== 'undefined' && location.hash.slice(1) === this._example) {
        setTimeout(() => this._elementRef.nativeElement.scrollIntoView(), 300);
      }
    } catch (e) {
      console.error(`Could not load example '${name}': ${e}`);
    }
  }

  private _generateExampleTabs(data: LiveExample | null) {
    const tabs: Record<string, string> = {};

    if (data) {
      // Name of the default example files. If files with such name exist within the example,
      // we provide a shorthand for them within the example tabs (for less verbose tabs).
      const exampleBaseFileName = `${this.example}-example`;
      const docsContentPath = `/docs-content/examples-highlighted/${data.packagePath}`;

      const tsPath = normalizePath(`${exampleBaseFileName}.ts`);
      const cssPath = normalizePath(`${exampleBaseFileName}.css`);
      const htmlPath = normalizePath(`${exampleBaseFileName}.html`);

      for (let fileName of data.files) {
        // Since the additional files refer to the original file name, we need to transform
        // the file name to match the highlighted HTML file that displays the source.
        const fileSourceName = fileName.replace(fileExtensionRegex, '$1-$2.html');
        const importPath = `${docsContentPath}/${fileSourceName}`;

        // Normalize the path to allow for more consistent displaying in the tabs,
        // and to make comparisons below more reliable.
        fileName = normalizePath(fileName);

        if (fileName === tsPath) {
          tabs['TS'] = importPath;
        } else if (fileName === cssPath) {
          tabs['CSS'] = importPath;
        } else if (fileName === htmlPath) {
          tabs['HTML'] = importPath;
        } else {
          tabs[fileName] = importPath;
        }
      }
    }

    this.exampleTabs.set(tabs);
  }
}
