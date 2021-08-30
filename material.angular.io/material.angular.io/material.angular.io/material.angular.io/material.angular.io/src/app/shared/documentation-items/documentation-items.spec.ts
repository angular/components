import {TestBed, inject, waitForAsync} from '@angular/core/testing';
import {DocumentationItems} from './documentation-items';

const COMPONENTS = 'components';
const CDK = 'cdk';

describe('DocViewer', () => {
  let docsItems: DocumentationItems;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [DocumentationItems]
    }).compileComponents();
  }));

  beforeEach(inject([DocumentationItems], (di: DocumentationItems) => {
    docsItems = di;
  }));

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

  it('should be sorted alphabetically (components)', () => {
    const components = docsItems.getItems(COMPONENTS).map(c => c.name);
    const sortedComponents = components.concat().sort();
    expect(components).toEqual(sortedComponents);
  });

  it('should be sorted alphabetically (cdk)', () => {
    const cdk = docsItems.getItems(CDK).map(c => c.name);
    const sortedCdk = cdk.concat().sort();
    expect(cdk).toEqual(sortedCdk);
  });
});
