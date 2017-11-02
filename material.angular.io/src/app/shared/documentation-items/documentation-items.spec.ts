import {TestBed, inject, async} from '@angular/core/testing';
import {DocumentationItems} from './documentation-items';

const COMPONENTS = 'components';

describe('DocViewer', () => {
  let docsItems: DocumentationItems;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [DocumentationItems]
    }).compileComponents();
  }));

  beforeEach(inject([DocumentationItems], (di: DocumentationItems) => {
    docsItems = di;
  }));

  it('get a list of categories', () => {
    expect(docsItems.getCategories(COMPONENTS)).toBeDefined();
    expect(docsItems.getCategories(COMPONENTS).length).toBeGreaterThan(0);
    for (const category of docsItems.getCategories(COMPONENTS)) {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.items).toBeDefined();
      expect(category.items.length).toBeGreaterThan(0);
    }
  });

  it('should get a list of all doc items', () => {
    expect(docsItems.getItems(COMPONENTS)).toBeDefined();
    expect(docsItems.getItems(COMPONENTS).length).toBeGreaterThan(0);
    for (const item of docsItems.getItems(COMPONENTS)) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
    }
  });

  it('should get a doc item by id', () => {
    expect(docsItems.getItemById('button', 'material')).toBeDefined();
  });
});
