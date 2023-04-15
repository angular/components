import {TestBed, inject, waitForAsync} from '@angular/core/testing';
import {GuideItems} from './guide-items';


describe('GuideItems', () => {
  let guideItems: GuideItems;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({}).compileComponents();
  }));

  beforeEach(inject([GuideItems], (gi: GuideItems) => {
    guideItems = gi;
  }));

  it('should get a list of all guide items', () => {
    expect(guideItems.getAllItems()).toBeDefined();
    expect(guideItems.getAllItems().length).toBeGreaterThan(0);
    for (const item of guideItems.getAllItems()) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.document).toBeDefined();
    }
  });

  it('should get a doc item by id', () => {
    expect(guideItems.getItemById('getting-started')).toBeDefined();
  });
});
