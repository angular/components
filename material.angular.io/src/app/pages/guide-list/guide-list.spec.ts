import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GuideList} from './guide-list';
import {provideRouter} from '@angular/router';

describe('GuideList', () => {
  let fixture: ComponentFixture<GuideList>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(GuideList);
  });

  it('should display a link for each item in guide items', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const totalItems = component.guideItems.getAllItems().length;
    const totalLinks = fixture.nativeElement.querySelectorAll('.docs-guide-item').length;
    expect(totalLinks).toEqual(totalItems);
  });
});
