import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {GuideViewer} from './guide-viewer';
import {guideResolver} from './guide-resolver';
import {ComponentPageTitle} from '../page-title/page-title';
import {GuideItems} from '../../shared/guide-items/guide-items';

@Component({template: ''})
class GuideList {}

describe('GuideViewer', () => {
  let harness: RouterTestingHarness;
  let guideItems: GuideItems;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: 'guides', component: GuideList},
            {path: 'guide/:id', component: GuideViewer, resolve: {guide: guideResolver}},
          ],
          withComponentInputBinding(),
        ),
      ],
    });

    harness = await RouterTestingHarness.create();
    guideItems = TestBed.inject(GuideItems);
  });

  it('should set the guide based off route params', async () => {
    const component = await harness.navigateByUrl('/guide/getting-started', GuideViewer);
    expect(component.guide()).toEqual(guideItems.getItemById('getting-started')!);
  });

  it('should set the page title to the guide name', async () => {
    await harness.navigateByUrl('/guide/getting-started', GuideViewer);
    expect(TestBed.inject(ComponentPageTitle).title).toBe(
      guideItems.getItemById('getting-started')!.name,
    );
  });

  it('should update the guide and page title when the route params change', async () => {
    const component = await harness.navigateByUrl('/guide/getting-started', GuideViewer);
    const reused = await harness.navigateByUrl('/guide/theming', GuideViewer);

    const theming = guideItems.getItemById('theming')!;
    expect(reused).toBe(component);
    expect(component.guide()).toEqual(theming);
    expect(TestBed.inject(ComponentPageTitle).title).toBe(theming.name);
  });

  it('should redirect to the guide list if the guide does not exist', async () => {
    await harness.navigateByUrl('/guide/does-not-exist');
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/guides');
  });
});
