import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Params} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {ComponentCategoryList, ComponentCategoryListModule} from './component-category-list';

describe('ComponentCategoryList', () => {
  let fixture: ComponentFixture<ComponentCategoryList>;
  let params: BehaviorSubject<Params>;

  beforeEach(waitForAsync(() => {
    params = new BehaviorSubject<Params>({});

    const fakeActivatedRoute = {
      snapshot: {},
      pathFromRoot: [{params}]
    };

    TestBed.configureTestingModule({
      imports: [ComponentCategoryListModule, DocsAppTestingModule],
      providers: [
        {provide: ActivatedRoute, useValue: fakeActivatedRoute}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentCategoryList);
  });

  it('should render a card for every component', () => {
    // Usually the component category list component won't be instantiated if the activated
    // route does not contain a `section` param. In case there is no section param before
    // `ngOnInit` subscribes to the activated route params, and an error will be raised.
    params.next({section: 'components'});
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const components = component.docItems.getItems('components');
    const cards = fixture
        .nativeElement.querySelectorAll('.docs-component-category-list-card');
    expect(cards.length).toEqual(components.length);
  });
});
