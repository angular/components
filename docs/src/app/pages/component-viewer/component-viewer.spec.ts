import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  NavigationEnd,
  provideRouter,
  Router,
  RouterOutlet,
  withComponentInputBinding,
} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {Observable} from 'rxjs';
import {filter, skip, take} from 'rxjs/operators';
import {ComponentViewer} from './component-viewer';
import {ComponentPageTitle} from '../page-title/page-title';

/** Resolves with the first value emitted by an observable. */
function firstValueFrom<T>(source: Observable<T>): Promise<T> {
  return source.pipe(take(1)).toPromise() as Promise<T>;
}

/** Stand-in for the sidenav, which sits between the `:section` and `:id` routes. */
@Component({template: '<router-outlet />', imports: [RouterOutlet]})
class Shell {}

@Component({template: ''})
class SectionPage {}

describe('ComponentViewer', () => {
  let harness: RouterTestingHarness;

  /** Navigates to a URL and returns the `ComponentViewer` rendered inside the shell. */
  async function navigate(url: string): Promise<ComponentViewer> {
    await harness.navigateByUrl(url);
    return harness.fixture.debugElement.query(By.directive(ComponentViewer))?.componentInstance;
  }

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
                    {path: '', component: SectionPage},
                    {path: ':id', component: ComponentViewer},
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
  });

  it('should bind the id and section route params', async () => {
    const component = await navigate('/cdk/overlay');
    expect(component.id()).toBe('overlay');
    expect(component.section()).toBe('cdk');
  });

  it('should load the doc item for the route params', async () => {
    const component = await navigate('/components/button');
    const doc = await firstValueFrom(component.componentDocItem);

    expect(doc.id).toBe('button');
    expect(doc.packageName).toBe('material');
    expect(TestBed.inject(ComponentPageTitle).title).toBe(doc.name);
  });

  it('should load the new doc item when the route params change', async () => {
    const component = await navigate('/components/button');
    await firstValueFrom(component.componentDocItem);

    const nextDoc = firstValueFrom(component.componentDocItem.pipe(skip(1)));
    const reused = await navigate('/components/checkbox');

    expect(reused).toBe(component);
    expect((await nextDoc).id).toBe('checkbox');
  });

  it('should redirect to the section if the doc item does not exist', async () => {
    const router = TestBed.inject(Router);
    const redirected = firstValueFrom(
      router.events.pipe(filter(e => e instanceof NavigationEnd && e.url === '/components')),
    );

    await navigate('/components/does-not-exist');
    await redirected;

    expect(router.url).toBe('/components');
  });
});
