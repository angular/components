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

  it('should set the footer below the bottom of the given view', () => {
    const viewHeight = 1200;
    const prevHeight = fixture.debugElement.styles['height'];
    fixture.debugElement.styles['height'] = `${viewHeight}px`;
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('app-footer');
    const main = fixture.nativeElement.querySelector('main');

    expect(main.getBoundingClientRect().height)
      .withContext('main content should take up the full given height')
      .toBe(viewHeight);
    expect(main.getBoundingClientRect().height + footer.getBoundingClientRect().height)
      .withContext('footer should overflow allowed viewport')
      .toBe(viewHeight + footer.getBoundingClientRect().height);

    fixture.debugElement.styles['height'] = prevHeight;
  });
});
