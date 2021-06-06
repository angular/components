import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {GuideList, GuideListModule} from './guide-list';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('GuideList', () => {
  let fixture: ComponentFixture<GuideList>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GuideListModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideList);
  });

  it('should display a link for each item in guide items', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const totalItems = component.guideItems.getAllItems().length;
    const totalLinks = fixture
      .nativeElement
      .querySelectorAll('.docs-guide-item')
      .length;
    expect(totalLinks).toEqual(totalItems);
  });
});
