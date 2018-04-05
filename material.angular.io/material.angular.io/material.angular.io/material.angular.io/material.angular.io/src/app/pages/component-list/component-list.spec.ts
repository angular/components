import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {of as observableOf} from 'rxjs';
import {ComponentList, ComponentListModule} from './component-list';
import {DocsAppTestingModule} from '../../testing/testing-module';

const CATEGORY_ID = 'forms';
const routeWithParams = new ActivatedRoute();
routeWithParams.params = observableOf({
  section: 'components',
  id: CATEGORY_ID,
});
const mockActivatedRoute = {
  pathFromRoot: [routeWithParams]
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
