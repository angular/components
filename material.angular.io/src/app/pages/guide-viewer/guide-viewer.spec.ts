import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {GuideViewer, GuideViewerModule} from './guide-viewer';
import {provideHttpClient} from '@angular/common/http';

const guideItemsId = 'getting-started';

const mockActivatedRoute = {
  fragment: new Observable(observer => {
    observer.complete();
  }),
  params: new Observable(observer => {
    observer.next({id: guideItemsId});
    observer.complete();
  }),
};

describe('GuideViewer', () => {
  let fixture: ComponentFixture<GuideViewer>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GuideViewerModule],
      providers: [
        provideRouter([]),
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        provideHttpClient(),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideViewer);
  });

  it('should set the guide based off route params', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.guide).toEqual(component.guideItems.getItemById(guideItemsId));
  });
});
