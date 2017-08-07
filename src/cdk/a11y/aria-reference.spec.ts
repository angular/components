import {addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId} from './aria-reference';

describe('AriaReference', () => {
  let testElement: HTMLElement | null;

  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    document.body.removeChild(testElement!);
  });

  it('should be able to append/remove aria reference IDs', () => {
    addId('reference_1');
    expectIds(['reference_1']);

    addId('reference_2');
    expectIds(['reference_1', 'reference_2']);

    removeId('reference_1');
    expectIds(['reference_2']);

    removeId('reference_2');
    expectIds([]);
  });

  it('should trim whitespace when adding/removing reference IDs', () => {
    addId('   reference_1   ');
    addId('   reference_2   ');
    expectIds(['reference_1', 'reference_2']);

    removeId('  reference_1  ');
    expectIds(['reference_2']);

    removeId('  reference_2  ');
    expectIds([]);
  });

  it('should ignore empty string', () => {
    addId('  ');
    expectIds([]);
  });

  it('should not add the same reference id if it already exists', () => {
    addId('reference_1');
    addId('reference_1');
    expect(['reference_1']);
  });

  /** Utility that adds the id to the test element with an arbitrary aria attribute. */
  function addId(id: string) {
    addAriaReferencedId(testElement!, id, 'aria-describedby');
  }

  /** Utility that removes the id to the test element with an arbitrary aria attribute. */
  function removeId(id: string) {
    removeAriaReferencedId(testElement!, id, 'aria-describedby');
  }

  /**
   * Expects the equal array from getAriaReferenceIds and a space-deliminated list from
   * the actual element attribute. If ids is empty, assumes the element should not have any
   * value
   */
  function expectIds(ids: string[]) {
    expect(getAriaReferenceIds(testElement!, 'aria-describedby')).toEqual(ids);
    expect(testElement!.getAttribute('aria-describedby')).toBe(ids.length ? ids.join(' ') : '');
  }
});
