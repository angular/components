import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EXAMPLE_COMPONENTS} from '@angular/components-examples';
import {ExampleViewer} from './example-viewer';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';

const exampleKey = 'autocomplete-overview';
const exampleBasePath = `/docs-content/examples-highlighted/material/autocomplete/${exampleKey}`;

describe('ExampleViewer', () => {
  let fixture: ComponentFixture<ExampleViewer>;
  let component: ExampleViewer;
  let loader: HarnessLoader;

  function waitForTabsLoad() {
    return new Promise<void>(resolve => {
      const interval = setInterval(() => {
        if (component.exampleTabs) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });

    fixture = TestBed.createComponent(ExampleViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should toggle between the 3 views', () => {
    // need to specify a file because toggling from snippet to full changes the tabs to match
    component.file = 'file.html';
    component.view = 'snippet';
    expect(component.view).toBe('snippet');
    component.toggleCompactView();
    expect(component.view).toBe('full');
    component.toggleSourceView();
    expect(component.view).toBe('demo');
  });

  it('should expand to HTML tab', async () => {
    component.example = exampleKey;
    component.file = 'file.html';
    component.view = 'snippet';
    await waitForTabsLoad();
    component.toggleCompactView();

    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tab = await tabGroup.getSelectedTab();
    expect(await tab.getLabel()).toBe('HTML');
  });

  it('should expand to TS tab', async () => {
    component.example = exampleKey;
    component.file = EXAMPLE_COMPONENTS[exampleKey].primaryFile;
    component.view = 'snippet';
    await waitForTabsLoad();
    component.toggleCompactView();

    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tab = await tabGroup.getSelectedTab();
    expect(await tab.getLabel()).toBe('TS');
  });

  it('should expand to CSS tab', async () => {
    component.example = exampleKey;
    component.file = 'file.css';
    component.view = 'snippet';
    await waitForTabsLoad();
    component.toggleCompactView();

    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tab = await tabGroup.getSelectedTab();
    expect(await tab.getLabel()).toBe('CSS');
  });

  it('should generate correct url with region', async () => {
    component.example = exampleKey;
    component.region = 'region';
    await waitForTabsLoad();
    const url = component.generateUrl('a.b.html');
    expect(url).toBe(exampleBasePath + '/a.b_region-html.html');
  });

  it('should generate correct url without region', async () => {
    component.example = exampleKey;
    component.region = undefined;
    await waitForTabsLoad();
    const url = component.generateUrl('a.b.ts');
    expect(url).toBe(exampleBasePath + '/a.b-ts.html');
  });

  it('should print an error message about incorrect file type', async () => {
    spyOn(console, 'error');
    component.example = exampleKey;
    component.file = 'file.bad';
    await waitForTabsLoad();
    component.selectCorrectTab();

    expect(console.error).toHaveBeenCalledWith(`Could not find tab for file extension: "bad".`);
  });

  it('should set and return example properly', async () => {
    component.example = exampleKey;
    await waitForTabsLoad();
    const data = component.exampleData;
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleKey]);
  });

  it('should print an error message about missing example', async () => {
    spyOn(console, 'error');
    component.example = 'foobar';
    await waitForTabsLoad();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Could not find example: foobar');
  });

  it('should return docs-content path for example based on extension', async () => {
    // set example
    component.example = exampleKey;
    await waitForTabsLoad();

    // get example file path for each extension
    const extensions = ['ts', 'css', 'html'];

    extensions.forEach(extension => {
      const expected = `${exampleBasePath}/${exampleKey}-example-${extension}.html`;
      const actual = component.exampleTabs[extension.toUpperCase()];

      expect(actual).toEqual(expected);
    });
  });

  describe('view-source tab group', () => {
    it('should only render HTML, TS and CSS files if no additional files are specified', async () => {
      component.example = exampleKey;
      await waitForTabsLoad();

      expect(component._getExampleTabNames()).toEqual(['HTML', 'TS', 'CSS']);
    });

    it('should be able to render additional files', async () => {
      EXAMPLE_COMPONENTS['additional-files'] = {
        ...EXAMPLE_COMPONENTS[exampleKey],
        files: [
          'additional-files-example.ts',
          'additional-files-example.html',
          'additional-files-example.css',
          './some-file-using-a-dot.ts',
          'some-additional-file.html',
        ],
      };

      component.example = 'additional-files';
      await waitForTabsLoad();

      expect(component._getExampleTabNames()).toEqual([
        'HTML',
        'TS',
        'CSS',
        'some-file-using-a-dot.ts',
        'some-additional-file.html',
      ]);
    });

    it('should be possible for example to not have CSS or HTML files', async () => {
      EXAMPLE_COMPONENTS['additional-files'] = {
        ...EXAMPLE_COMPONENTS[exampleKey],
        files: ['additional-files-example.ts'],
      };

      component.example = 'additional-files';
      await waitForTabsLoad();

      expect(component._getExampleTabNames()).toEqual(['TS']);
    });
  });
});
