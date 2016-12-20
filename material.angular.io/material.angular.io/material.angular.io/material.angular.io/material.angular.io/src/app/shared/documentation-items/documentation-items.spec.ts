import {TestBed, inject, async} from '@angular/core/testing';
import {DocumentationItems} from './documentation-items';


describe('DocViewer', () => {
  let docsItems: DocumentationItems;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [DocumentationItems]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([DocumentationItems], (di: DocumentationItems) => {
    docsItems = di;
  }));

  it('get a list of categories', () => {
    expect(docsItems.getItemsInCategories()).toBeDefined();
    expect(docsItems.getItemsInCategories().length).toBeGreaterThan(0);
    for (const category of docsItems.getItemsInCategories()) {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.items).toBeDefined();
      expect(category.items.length).toBeGreaterThan(0);
    }
  });

  it('should get a list of all doc items', () => {
    expect(docsItems.getAllItems()).toBeDefined();
    expect(docsItems.getAllItems().length).toBeGreaterThan(0);
    for (const item of docsItems.getAllItems()) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
    }
  });

  it('should get a doc item by id', () => {
    expect(docsItems.getItemById('button')).toBeDefined();
  });
});
