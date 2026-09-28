import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject, Observable} from 'rxjs';
import {ActivatedRoute, Params, provideRouter} from '@angular/router';
import {GuideViewer} from './guide-viewer';
import {ComponentPageTitle} from '../page-title/page-title';

const guideItemsId = 'getting-started';

describe('GuideViewer', () => {
  let fixture: ComponentFixture<GuideViewer>;
  let params: BehaviorSubject<Params>;

  beforeEach(() => {
    params = new BehaviorSubject<Params>({id: guideItemsId});

    const mockActivatedRoute = {
      fragment: new Observable(observer => {
        observer.complete();
      }),
      params,
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: ActivatedRoute, useValue: mockActivatedRoute}],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideViewer);
  });

  it('should set the guide based off route params', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.guide()).toEqual(component.guideItems.getItemById(guideItemsId));
  });

  it('should set the page title to the guide name', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(TestBed.inject(ComponentPageTitle).title).toBe(
      component.guideItems.getItemById(guideItemsId)!.name,
    );
  });

  it('should update the guide and page title when the route params change', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();

    params.next({id: 'theming'});
    fixture.detectChanges();

    const theming = component.guideItems.getItemById('theming')!;
    expect(component.guide()).toEqual(theming);
    expect(TestBed.inject(ComponentPageTitle).title).toBe(theming.name);
  });
});
