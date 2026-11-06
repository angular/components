import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {provideRouter, RouterOutlet, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {BehaviorSubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {ComponentOverview, ComponentViewer} from './component-viewer';
import {docItemResolver} from './doc-item-resolver';
import {TableOfContents} from '../../shared/table-of-contents/table-of-contents';

/** Stand-in for the sidenav, which sits between the `:section` and `:id` routes. */
@Component({template: '<router-outlet />', imports: [RouterOutlet]})
class Shell {}

describe('ComponentBaseView', () => {
  let harness: RouterTestingHarness;
  let httpTestingController: HttpTestingController;

  /** Whether the screen is small enough for the table of contents to be hidden. */
  let isSmallScreen: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isSmallScreen = new BehaviorSubject(false);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () =>
              isSmallScreen.pipe(map(matches => ({matches, breakpoints: {}}) as BreakpointState)),
          },
        },
        provideRouter(
          [
            {
              path: ':section',
              children: [
                {
                  path: '',
                  component: Shell,
                  children: [
                    {
                      path: ':id',
                      component: ComponentViewer,
                      resolve: {docItem: docItemResolver},
                      children: [{path: 'overview', component: ComponentOverview}],
                    },
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
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  /** Navigates to a URL and waits for it to render. */
  async function navigate(url: string) {
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  /** Responds to the request for a component's overview document. */
  function flushOverview(id: string) {
    httpTestingController
      .expectOne(`/docs-content/overviews/material/${id}/${id}.md.html`)
      .flush(`<h2 id="usage">Usage</h2>`);
  }

  describe('overview', () => {
    it('should add the headers to the table of contents when it is shown again', async () => {
      isSmallScreen.next(true);
      await navigate('/components/button/overview');
      flushOverview('button');
      await harness.fixture.whenStable();

      const addHeadersSpy = spyOn(TableOfContents.prototype, 'addHeaders').and.callThrough();
      isSmallScreen.next(false);
      harness.detectChanges();
      await harness.fixture.whenStable();

      expect(addHeadersSpy).toHaveBeenCalledWith('Overview Content', jasmine.any(HTMLElement), 0);
    });

    it('should reset the table of contents when the doc item changes', async () => {
      await navigate('/components/button/overview');
      flushOverview('button');
      await harness.fixture.whenStable();

      const resetHeadersSpy = spyOn(TableOfContents.prototype, 'resetHeaders').and.callThrough();
      await navigate('/components/checkbox/overview');

      expect(resetHeadersSpy).toHaveBeenCalled();
    });
  });
});
