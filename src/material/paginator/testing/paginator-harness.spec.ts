import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatPaginatorHarness} from './paginator-harness';

describe('MatPaginatorHarness', () => {
  let fixture: ComponentFixture<PaginatorHarnessTest>;
  let loader: HarnessLoader;
  let instance: PaginatorHarnessTest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatPaginatorModule, NoopAnimationsModule, PaginatorHarnessTest],
    });

    fixture = TestBed.createComponent(PaginatorHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    instance = fixture.componentInstance;
  });

  it('should load all paginator harnesses', async () => {
    const paginators = await loader.getAllHarnesses(MatPaginatorHarness);
    expect(paginators.length).toBe(1);
  });

  it('should be able to go to the next page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageIndex()).toBe(0);
    await paginator.goToNextPage();
    expect(instance.pageIndex()).toBe(1);
  });

  it('should be able to go to the previous page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    instance.pageIndex.set(5);
    fixture.detectChanges();

    await paginator.goToPreviousPage();
    expect(instance.pageIndex()).toBe(4);
  });

  it('should be able to go to the first page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    instance.pageIndex.set(5);
    fixture.detectChanges();

    await paginator.goToFirstPage();
    expect(instance.pageIndex()).toBe(0);
  });

  it('should be able to go to the last page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageIndex()).toBe(0);
    await paginator.goToLastPage();
    expect(instance.pageIndex()).toBe(49);
  });

  it('should be able to set the page size', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageSize).toBe(10);
    await paginator.setPageSize(25);
    expect(instance.pageSize).toBe(25);
  });

  it('should be able to get the page size', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getPageSize()).toBe(10);
  });

  it('should be able to get the range label', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getRangeLabel()).toBe('1 – 10 of 500');
  });

  it('should throw an error if the first page button is not available', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    instance.showFirstLastButtons.set(false);
    fixture.detectChanges();

    await expectAsync(paginator.goToFirstPage()).toBeRejectedWithError(
      /Could not find first page button inside paginator/,
    );
  });

  it('should return whether or not the previous page is disabled', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.isPreviousPageDisabled()).toBe(false);
  });

  it('should return whether or not the next page is disabled', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);
    await paginator.goToLastPage();
    expect(await paginator.isNextPageDisabled()).toBe(false);
  });

  it('should throw an error if the last page button is not available', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    instance.showFirstLastButtons.set(false);
    fixture.detectChanges();

    await expectAsync(paginator.goToLastPage()).toBeRejectedWithError(
      /Could not find last page button inside paginator/,
    );
  });

  it('should throw an error if the page size selector is not available', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    instance.pageSizeOptions.set([]);
    fixture.detectChanges();

    await expectAsync(paginator.setPageSize(10)).toBeRejectedWithError(
      /Cannot find page size selector in paginator/,
    );
  });
});

@Component({
  template: `
    <mat-paginator
      (page)="handlePageEvent($event)"
      [length]="length"
      [pageSize]="pageSize"
      [showFirstLastButtons]="showFirstLastButtons()"
      [pageSizeOptions]="pageSizeOptions()"
      [pageIndex]="pageIndex()">
    </mat-paginator>
  `,
  standalone: true,
  imports: [MatPaginatorModule],
})
class PaginatorHarnessTest {
  length = 500;
  pageSize = 10;
  pageIndex = signal(0);
  pageSizeOptions = signal([5, 10, 25]);
  showFirstLastButtons = signal(true);

  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex.set(event.pageIndex);
  }
}
