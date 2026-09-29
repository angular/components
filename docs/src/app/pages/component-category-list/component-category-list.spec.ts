import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter, RouterOutlet, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {ComponentCategoryList} from './component-category-list';
import {ComponentPageTitle} from '../page-title/page-title';
import {DocumentationItems, SECTIONS} from '../../shared/documentation-items/documentation-items';

/** Stand-in for the sidenav, which sits between the `:section` and `categories` routes. */
@Component({template: '<router-outlet />', imports: [RouterOutlet]})
class Shell {}

/** Waits for pending promises, such as loading the doc items, to settle. */
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve));
}

describe('ComponentCategoryList', () => {
  let harness: RouterTestingHarness;

  /** Navigates to a URL and returns the `ComponentCategoryList` rendered inside the shell. */
  async function navigate(url: string): Promise<ComponentCategoryList> {
    await harness.navigateByUrl(url);
    return harness.fixture.debugElement.query(By.directive(ComponentCategoryList))
      ?.componentInstance;
  }
  let docItems: DocumentationItems;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: ':section',
              children: [
                {
                  path: '',
                  component: Shell,
                  children: [
                    {path: 'categories', children: [{path: '', component: ComponentCategoryList}]},
                  ],
                },
              ],
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });

    harness = await RouterTestingHarness.create();
    docItems = TestBed.inject(DocumentationItems);

    // Load the doc data up front so that the component's lookups resolve within one flush.
    await docItems.getData();
  });

  it('should bind the section from the parent route params', async () => {
    const component = await navigate('/cdk/categories');
    expect(component.section()).toBe('cdk');
  });

  it('should set the page title to the section name', async () => {
    await navigate('/cdk/categories');
    expect(TestBed.inject(ComponentPageTitle).title).toBe(SECTIONS['cdk'].name);
  });

  it('should list the items of the section', async () => {
    const component = await navigate('/cdk/categories');
    await flushPromises();

    expect(component.items()).toEqual(await docItems.getItems('cdk'));
  });

  it('should update when the section changes', async () => {
    const component = await navigate('/cdk/categories');
    const reused = await navigate('/components/categories');
    await flushPromises();

    expect(reused).toBe(component);
    expect(component.section()).toBe('components');
    expect(TestBed.inject(ComponentPageTitle).title).toBe(SECTIONS['components'].name);
    expect(component.items()).toEqual(await docItems.getItems('components'));
  });
});
