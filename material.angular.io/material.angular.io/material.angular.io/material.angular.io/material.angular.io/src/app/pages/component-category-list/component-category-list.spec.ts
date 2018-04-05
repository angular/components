import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {of as observableOf} from 'rxjs';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {ComponentCategoryList, ComponentCategoryListModule} from './component-category-list';


describe('ComponentCategoryList', () => {
  let fixture: ComponentFixture<ComponentCategoryList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentCategoryListModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentCategoryList);
  });

  it('should set set up base param observable on init', () => {
    const component = fixture.componentInstance;
    spyOn(component, 'ngOnInit').and.callThrough();
    fixture.detectChanges();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(component.params).toBeDefined();
  });

  it('should render a card for every category', () => {
    fixture.detectChanges();
    // Params is replaced after ngOnit runs since params is set on init.
    fixture.componentInstance.params = observableOf({'section': 'components'});
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const categories = component.docItems.getCategories('components');
    const cards = fixture
        .nativeElement.querySelectorAll('.docs-component-category-list-card');
    expect(cards.length).toEqual(categories.length);
  });
});
