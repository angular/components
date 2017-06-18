import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentCategoryList, ComponentCategoryListModule} from './component-category-list';
import {DocsAppTestingModule} from '../../testing/testing-module';


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

  it('should set page title on init', () => {
    const component = fixture.componentInstance;
    spyOn(component, 'ngOnInit').and.callThrough();
    fixture.detectChanges();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(component._componentPageTitle.title).toEqual('Component Library');
  });

  it('should render a card for every category', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const categories = component.docItems.getItemsInCategories();
    const cards = fixture
      .nativeElement.querySelectorAll('.docs-component-category-list-card');
    expect(cards.length).toEqual(categories.length);
  });
});
