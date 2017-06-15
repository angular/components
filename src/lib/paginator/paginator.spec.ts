import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdPaginatorModule} from './index';
import {MdPaginator, PageChangeEvent} from './paginator';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdSelectModule} from '../select/index';
import {MdTooltipModule} from '../tooltip/index';
import {MdButtonModule} from '../button/index';
import {MdPaginatorIntl} from './paginator-intl';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {customMatchers} from '../core/testing/jasmine-matchers';
import {dispatchMouseEvent} from '../core/testing/dispatch-events';


describe('MdPaginator', () => {
  let fixture: ComponentFixture<MdPaginatorApp>;
  let component: MdPaginatorApp;
  let paginator: MdPaginator;

  beforeEach(async(() => {
    jasmine.addMatchers(customMatchers);

    TestBed.configureTestingModule({
      imports: [
        MdButtonModule,
        MdCommonModule,
        MdSelectModule,
        MdTooltipModule,
        MdPaginatorModule,
        NoopAnimationsModule,
      ],
      declarations: [
        MdPaginatorApp,
        MdPaginatorWithoutPageLengthOrOptionsApp,
        MdPaginatorWithoutPageLengthApp,
        MdPaginatorWithoutOptionsApp,
      ],
      providers: [MdPaginatorIntl]
    }).compileComponents();

    fixture = TestBed.createComponent(MdPaginatorApp);
    component = fixture.componentInstance;
    paginator = component.mdPaginator;

    fixture.detectChanges();
  }));

  describe('with the default internationalization provider', () => {
    it('should show the right range text', () => {
      const rangeElement = fixture.nativeElement.querySelector('.mat-paginator-range-label');

      // View second page of list of 100, each page contains 10 items.
      component.listLength = 100;
      component.pageLength = 10;
      component.currentPageIndex = 1;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 20 of 100');

      // View third page of list of 200, each page contains 20 items.
      component.listLength = 200;
      component.pageLength = 20;
      component.currentPageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('41 - 60 of 200');

      // View first page of list of 0, each page contains 5 items.
      component.listLength = 0;
      component.pageLength = 5;
      component.currentPageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('0 of 0');

      // View third page of list of 10, each page contains 5 items.
      component.listLength = 10;
      component.pageLength = 5;
      component.currentPageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 15 of 10');

      // View third page of list of -5, each page contains 5 items.
      component.listLength = -5;
      component.pageLength = 5;
      component.currentPageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 15 of 0');
    });

    it('should show right aria-labels for select and buttons', () => {
      expect(fixture.nativeElement.querySelector('.mat-select'))
          .toHaveAriaLabel('Items per page:');
      expect(fixture.nativeElement.querySelector('.mat-paginator-navigation-previous'))
          .toHaveAriaLabel('Previous page');
      expect(fixture.nativeElement.querySelector('.mat-paginator-navigation-next'))
          .toHaveAriaLabel('Next page');
    });
  });

  describe('when navigating with the navigation buttons', () => {
    it('should be able to go to the next page', () => {
      expect(paginator.currentPageIndex).toBe(0);

      component.clickNextButton();

      expect(paginator.currentPageIndex).toBe(1);
      expect(component.latestPageChangeEvent.currentPageIndex).toBe(1);
    });

    it('should be able to go to the previous page', () => {
      paginator.currentPageIndex = 1;
      fixture.detectChanges();
      expect(paginator.currentPageIndex).toBe(1);

      component.clickPreviousButton();

      expect(paginator.currentPageIndex).toBe(0);
      expect(component.latestPageChangeEvent.currentPageIndex).toBe(0);
    });

    it('should disable navigating to the next page if at first page', () => {
      component.goToLastPage();
      fixture.detectChanges();
      expect(paginator.currentPageIndex).toBe(10);
      expect(paginator.canNavigateToNextPage()).toBe(false);

      component.latestPageChangeEvent = null;
      component.clickNextButton();

      expect(component.latestPageChangeEvent).toBe(null);
      expect(paginator.currentPageIndex).toBe(10);
    });

    it('should disable navigating to the previous page if at first page', () => {
      expect(paginator.currentPageIndex).toBe(0);
      expect(paginator.canNavigateToPreviousPage()).toBe(false);

      component.latestPageChangeEvent = null;
      component.clickPreviousButton();

      expect(component.latestPageChangeEvent).toBe(null);
      expect(paginator.currentPageIndex).toBe(0);
    });
  });

  it('should fail if page length and page length options are not provided', () => {
    expect(() => {
      TestBed.createComponent(MdPaginatorWithoutPageLengthOrOptionsApp).detectChanges();
    }).toThrowError('No page length options available for the MdPaginator');
  });

  it('should default the page length options to the page length if no options provided', () => {
    const withoutOptionsAppFixture = TestBed.createComponent(MdPaginatorWithoutOptionsApp);
    withoutOptionsAppFixture.detectChanges();

    expect(withoutOptionsAppFixture.componentInstance.mdPaginator._displayedPageLengthOptions)
        .toEqual([10]);
  });

  it('should default the page length to the first page length option if no length provided', () => {
    const withoutLengthAppFixture = TestBed.createComponent(MdPaginatorWithoutPageLengthApp);
    withoutLengthAppFixture.detectChanges();

    expect(withoutLengthAppFixture.componentInstance.mdPaginator._pageLength).toBe(10);
  });

  it('should show a sorted list of page length options including the current page length', () => {
    expect(paginator._displayedPageLengthOptions).toEqual([5, 10, 25, 100]);

    component.pageLength = 30;
    fixture.detectChanges();
    expect(paginator.pageLengthOptions).toEqual([5, 10, 25, 100]);
    expect(paginator._displayedPageLengthOptions).toEqual([5, 10, 25, 30, 100]);

    component.pageLengthOptions = [100, 25, 10, 5];
    fixture.detectChanges();
    expect(paginator._displayedPageLengthOptions).toEqual([5, 10, 25, 30, 100]);
  });

  it('should be able to change the page length while keeping the first item present', () => {
    // Start on the third page of a list of 100 with a page length of 10.
    component.currentPageIndex = 4;
    component.pageLength = 10;
    component.listLength = 100;
    fixture.detectChanges();

    // The first item of the page should be item with index 40
    let firstPageItemIndex = paginator.currentPageIndex * paginator.pageLength;
    expect(firstPageItemIndex).toBe(40);

    // The first item on the page is now 25. Change the page length to 25 so that we should now be
    // on the second page where the top item is index 25.
    paginator._changePageLength(25);
    let paginationEvent = component.latestPageChangeEvent;
    firstPageItemIndex = paginationEvent.currentPageIndex * paginationEvent.pageLength;
    expect(firstPageItemIndex).toBe(25);
    expect(paginationEvent.currentPageIndex).toBe(1);

    // The first item on the page is still 25. Change the page length to 8 so that we should now be
    // on the fourth page where the top item is index 24.
    paginator._changePageLength(8);
    paginationEvent = component.latestPageChangeEvent;
    firstPageItemIndex = paginationEvent.currentPageIndex * paginationEvent.pageLength;
    expect(firstPageItemIndex).toBe(24);
    expect(paginationEvent.currentPageIndex).toBe(3);

    // The first item on the page is 24. Change the page length to 16 so that we should now be
    // on the first page where the top item is index 0.
    paginator._changePageLength(25);
    paginationEvent = component.latestPageChangeEvent;
    firstPageItemIndex = paginationEvent.currentPageIndex * paginationEvent.pageLength;
    expect(firstPageItemIndex).toBe(0);
    expect(paginationEvent.currentPageIndex).toBe(0);
  });

  it('should show a select only if there are multiple options', () => {
    expect(paginator._displayedPageLengthOptions).toEqual([5, 10, 25, 100]);
    expect(fixture.nativeElement.querySelector('.mat-select')).not.toBeNull();

    // Remove options so that the paginator only uses the current page length (10) as an option.
    // Should no longer show the select component since there is only one option.
    component.pageLengthOptions = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mat-select')).toBeNull();
  });
});

@Component({
  template: `
    <md-paginator [currentPageIndex]="currentPageIndex"
                  [pageLength]="pageLength"
                  [pageLengthOptions]="pageLengthOptions"
                  [listLength]="listLength"
                  (pageChange)="latestPageChangeEvent = $event">
    </md-paginator>
  `,
})
class MdPaginatorApp {
  currentPageIndex = 0;
  pageLength = 10;
  pageLengthOptions = [5, 10, 25, 100];
  listLength = 100;

  latestPageChangeEvent: PageChangeEvent;

  @ViewChild(MdPaginator) mdPaginator: MdPaginator;

  constructor(private _elementRef: ElementRef) { }

  clickPreviousButton() {
    const previousButton =
        this._elementRef.nativeElement.querySelector('.mat-paginator-navigation-previous');
    dispatchMouseEvent(previousButton, 'click');
  }

  clickNextButton() {
    const nextButton =
        this._elementRef.nativeElement.querySelector('.mat-paginator-navigation-next');
    dispatchMouseEvent(nextButton, 'click');  }

  goToLastPage() {
    this.currentPageIndex = Math.ceil(this.listLength / this.pageLength);
  }
}

@Component({
  template: `
    <md-paginator></md-paginator>
  `,
})
class MdPaginatorWithoutPageLengthOrOptionsApp { }

@Component({
  template: `
    <md-paginator [pageLengthOptions]="[10, 20, 30]"></md-paginator>
  `,
})
class MdPaginatorWithoutPageLengthApp {
  @ViewChild(MdPaginator) mdPaginator: MdPaginator;
}

@Component({
  template: `
    <md-paginator [pageLength]="10"></md-paginator>
  `,
})
class MdPaginatorWithoutOptionsApp {
  @ViewChild(MdPaginator) mdPaginator: MdPaginator;
}
