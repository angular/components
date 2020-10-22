import {Component, Input, ViewChild} from '@angular/core';
import {async, fakeAsync, TestBed} from '@angular/core/testing';
import {CdkTable, CdkTableModule} from '@angular/cdk/table';
import {CdkScrollableTableBodyModule} from './scrollable-table-body-module';


describe('CdkScrollableTableBody', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CdkScrollableTableBodyModule, CdkTableModule],
      declarations: [CdkTableWithScrollableBody],
    }).compileComponents();
  }));

  it('wraps row outlets in container', fakeAsync(() => {
    const fixture = TestBed.createComponent(CdkTableWithScrollableBody);
    const testComponent = fixture.componentInstance;
    fixture.detectChanges();
    const table = testComponent.table;
    const headerOutletContainer = table._headerRowOutlet.elementRef.nativeElement.parentElement;
    const rowOutletContainer = table._rowOutlet.elementRef.nativeElement.parentElement;
    const footerOutletContainer = table._footerRowOutlet.elementRef.nativeElement.parentElement;
    testComponent.maxHeight = '100px';

    expect(headerOutletContainer.classList.contains('cdk-table-scrollable-table-header'))
      .toBe(true);
    expect(rowOutletContainer.classList.contains('cdk-table-scrollable-table-body'))
      .toBe(true);
    expect(footerOutletContainer.classList.contains('cdk-table-scrollable-table-footer'))
      .toBe(true);
  }));

  it('updates DOM when max height is changed', fakeAsync(() => {
    const fixture = TestBed.createComponent(CdkTableWithScrollableBody);
    const testComponent = fixture.componentInstance;
    fixture.detectChanges();
    const table = testComponent.table;
    const rowOutletContainer = table._rowOutlet.elementRef.nativeElement.parentElement;

    testComponent.maxHeight = '100px';
    fixture.detectChanges();
    expect(rowOutletContainer.style.maxHeight).toBe('100px');

    testComponent.maxHeight = '200px';
    fixture.detectChanges();
    expect(rowOutletContainer.style.maxHeight).toBe('200px');
  }));
});

interface TestData {
  a: string;
  b: string;
  c: string;
}

@Component({
  template: `
    <cdk-table [dataSource]="dataSource" [scrollableBody]="maxHeight">
      <ng-container cdkColumnDef="column_a">
        <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer A </cdk-footer-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_b">
        <cdk-header-cell *cdkHeaderCellDef> Column B </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer B </cdk-footer-cell>
      </ng-container>

      <ng-container cdkColumnDef="column_c">
        <cdk-header-cell *cdkHeaderCellDef> Column C </cdk-header-cell>
        <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
        <cdk-footer-cell *cdkFooterCellDef> Footer C </cdk-footer-cell>
      </ng-container>

      <cdk-header-row *cdkHeaderRowDef="columnsToRender"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: columnsToRender"></cdk-row>
      <cdk-footer-row *cdkFooterRowDef="columnsToRender"></cdk-footer-row>
    </cdk-table>
  `
})
class CdkTableWithScrollableBody {
  dataSource: [];
  columnsToRender = ['column_a', 'column_b', 'column_c'];

  @Input() maxHeight!: string;
  @ViewChild(CdkTable) table: CdkTable<TestData>;
}
