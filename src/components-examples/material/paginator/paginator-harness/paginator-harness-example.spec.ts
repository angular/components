import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatPaginatorHarness} from '@angular/material/paginator/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {PaginatorHarnessExample} from './paginator-harness-example';

describe('PaginatorHarnessExample', () => {
  let fixture: ComponentFixture<PaginatorHarnessExample>;
  let loader: HarnessLoader;
  let instance: PaginatorHarnessExample;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    instance = fixture.componentInstance;
  });

  it('should load all paginator harnesses', async () => {
    const paginators = await loader.getAllHarnesses(MatPaginatorHarness);
    expect(paginators.length).toBe(1);
  });

  it('should be able to navigate between pages', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToNextPage();
    expect(instance.pageIndex).toBe(1);
    await paginator.goToPreviousPage();
    expect(instance.pageIndex).toBe(0);
  });

  it('should be able to go to the last page', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToLastPage();
    expect(instance.pageIndex).toBe(49);
  });

  it('should be able to set the page size', async () => {
    const paginator = await loader.getHarness(MatPaginatorHarness);

    expect(instance.pageSize).toBe(10);
    await paginator.setPageSize(25);
    expect(instance.pageSize).toBe(25);
  });
});
