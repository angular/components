import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {ComponentList, ComponentListModule} from './component-list';
import {DocsAppTestingModule} from '../../testing/testing-module';

const CATEGORY_ID = 'forms';
const mockActivatedRoute = {
  pathFromRoot: Observable.create(observer => {
    observer.next({
      params: {
        section: 'components',
        id: CATEGORY_ID,
      }
    });
    observer.complete();
  })
};

describe('ComponentList', () => {
  let fixture: ComponentFixture<ComponentList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentListModule, DocsAppTestingModule],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentList);
  });

  it('should set the category from router params', done => {
    const component = fixture.componentInstance;
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const actual = component.category;
      const expected = component.docItems.getCategoryById(CATEGORY_ID);
      expect(actual).toEqual(expected);
      done();
    });
  });
});
