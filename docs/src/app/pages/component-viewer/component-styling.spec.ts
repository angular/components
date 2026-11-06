import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter, RouterOutlet, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {ComponentViewer} from './component-viewer';
import {ComponentStyling} from './component-styling';
import {docItemResolver} from './doc-item-resolver';

/** Stand-in for the sidenav, which sits between the `:section` and `:id` routes. */
@Component({template: '<router-outlet />', imports: [RouterOutlet]})
class Shell {}

describe('ComponentStyling', () => {
  let harness: RouterTestingHarness;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
                      children: [{path: 'styling', component: ComponentStyling}],
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

  /**
   * Navigates to a URL and renders it. Doesn't wait for the app to be stable, because the token
   * data request is pending until the test responds to it.
   */
  async function navigate(url: string) {
    await harness.navigateByUrl(url);
    harness.detectChanges();
  }

  describe('styling', () => {
    function getText() {
      return (harness.routeNativeElement!.textContent ?? '').replace(/\s+/g, ' ');
    }

    it('should show the token overrides for the doc item', async () => {
      await navigate('/components/button/styling');
      expect(getText()).toContain('Loading...');

      httpTestingController.expectOne('/assets/tokens/tokens/button/button.json').flush({
        example: '<code>example-overrides</code>',
        themes: [
          {
            name: 'button',
            overridesMixin: 'mat.button-overrides',
            tokens: [
              {
                name: 'filled-container-color',
                overridesName: 'filled-container-color',
                prefix: 'mat-button-',
                type: 'color',
                value: 'red',
              },
            ],
          },
        ],
      });
      await harness.fixture.whenStable();
      harness.detectChanges();

      const text = getText();
      expect(text).not.toContain('Loading...');
      expect(text).toContain('the mat.button-overrides mixin');
      expect(text).toContain('For example:');
      expect(harness.routeNativeElement!.querySelector('pre')?.textContent).toBe(
        'example-overrides',
      );
    });

    it('should not request token data for packages without it', async () => {
      await navigate('/cdk/overlay/styling');

      httpTestingController.expectNone(() => true);
      expect(getText()).toContain('This component does not support style overrides');
    });

    it('should indicate if the doc item does not support style overrides', async () => {
      await navigate('/components/button/styling');
      httpTestingController
        .expectOne('/assets/tokens/tokens/button/button.json')
        .flush({example: null, themes: []});
      await harness.fixture.whenStable();
      harness.detectChanges();

      expect(getText()).toContain('This component does not support style overrides');
    });
  });
});
