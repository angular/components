import {TestBed} from '@angular/core/testing';
import {DocumentationItems} from './documentation-items';

const COMPONENTS = 'components';
const CDK = 'cdk';

describe('DocViewer', () => {
  let docsItems: DocumentationItems;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    docsItems = TestBed.inject(DocumentationItems);
  });

  it('should get a list of all doc items', async () => {
    const items = await docsItems.getItems(COMPONENTS);

    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
    }
  });

  it('should get a doc item by id', async () => {
    expect(await docsItems.getItemById('button', 'material')).toBeDefined();
  });

  it('should be sorted alphabetically (components)', async () => {
    const items = await docsItems.getItems(COMPONENTS);
    const components = items.map(c => c.name);
    const sortedComponents = components.concat().sort();
    expect(components).toEqual(sortedComponents);
  });

  it('should be sorted alphabetically (cdk)', async () => {
    const items = await docsItems.getItems(CDK);
    const cdk = items.map(c => c.name);
    const sortedCdk = cdk.concat().sort();
    expect(cdk).toEqual(sortedCdk);
  });
});
