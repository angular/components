import {Component} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {
  getTableTextColumnMissingNameError,
  getTableTextColumnMissingParentTableError,
} from './table-errors';
import {CdkTableModule} from './table-module';
import {expectTableToMatchContent} from './table.spec';
import {TEXT_COLUMN_OPTIONS, TextColumnOptions} from './tokens';

describe('CdkTextColumn', () => {
  let fixture: ComponentFixture<BasicTextColumnApp>;
  let component: BasicTextColumnApp;
  let tableElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkTableModule,
        BasicTextColumnApp,
        MissingTableApp,
        TextColumnWithoutNameApp,
        TextColumnWithFooter,
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicTextColumnApp);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tableElement = fixture.nativeElement.querySelector('.cdk-table');
  });

  it('should render the basic columns', () => {
    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
    ]);
  });

  it('should throw an error if the text column is not in the content of a table', () => {
    expect(() => TestBed.createComponent(MissingTableApp).detectChanges()).toThrowError(
      getTableTextColumnMissingParentTableError().message,
    );
  });

  it('should throw an error if the text column does not have a name', () => {
    expect(() => TestBed.createComponent(TextColumnWithoutNameApp).detectChanges()).toThrowError(
      getTableTextColumnMissingNameError().message,
    );
  });

  it('should allow for alternate header text', () => {
    component.headerTextB = 'column-b';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'column-b', 'PropertyC'],
      ['a_1', 'b_1', 'c_1'],
      ['a_2', 'b_2', 'c_2'],
    ]);
  });

  it('should allow for custom data accessor', () => {
    component.dataAccessorA = (data: TestData) => data.propertyA + '!';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1!', 'b_1', 'c_1'],
      ['a_2!', 'b_2', 'c_2'],
    ]);
  });

  it('should allow for custom data accessor', () => {
    component.dataAccessorA = (data: TestData) => data.propertyA + '!';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['a_1!', 'b_1', 'c_1'],
      ['a_2!', 'b_2', 'c_2'],
    ]);
  });

  it('should update values when data changes', () => {
    component.data = [
      {propertyA: 'changed-a_1', propertyB: 'b_1', propertyC: 'c_1'},
      {propertyA: 'changed-a_2', propertyB: 'b_2', propertyC: 'c_2'},
    ];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expectTableToMatchContent(tableElement, [
      ['PropertyA', 'PropertyB', 'PropertyC'],
      ['changed-a_1', 'b_1', 'c_1'],
      ['changed-a_2', 'b_2', 'c_2'],
    ]);
  });

  describe('with options', () => {
    function createTestComponent(options: TextColumnOptions<any>) {
      // Reset the previously configured testing module to be able set new providers.
      // The testing module has been initialized in the root describe group for the ripples.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CdkTableModule, BasicTextColumnApp],
        providers: [{provide: TEXT_COLUMN_OPTIONS, useValue: options}],
      });

      fixture = TestBed.createComponent(BasicTextColumnApp);
      fixture.detectChanges();

      tableElement = fixture.nativeElement.querySelector('.cdk-table');
    }

    it('should be able to provide a header text transformation', () => {
      const defaultHeaderTextTransform = (name: string) => `${name}!`;
      createTestComponent({defaultHeaderTextTransform});

      expectTableToMatchContent(tableElement, [
        ['propertyA!', 'propertyB!', 'propertyC!'],
        ['a_1', 'b_1', 'c_1'],
        ['a_2', 'b_2', 'c_2'],
      ]);
    });

    it('should be able to provide a general data accessor', () => {
      const defaultDataAccessor = (data: TestData, name: string) => {
        switch (name) {
          case 'propertyA':
            return `A: ${data.propertyA}`;
          case 'propertyB':
            return `B: ${data.propertyB}`;
          case 'propertyC':
            return `C: ${data.propertyC}`;
          default:
            return '';
        }
      };
      createTestComponent({defaultDataAccessor});

      expectTableToMatchContent(tableElement, [
        ['PropertyA', 'PropertyB', 'PropertyC'],
        ['A: a_1', 'B: b_1', 'C: c_1'],
        ['A: a_2', 'B: b_2', 'C: c_2'],
      ]);
    });
  });

  describe('with footer', () => {
    const expectedDefaultTableHeaderAndData = [
      ['PropertyA', 'PropertyB', 'PropertyC', 'PropertyD'],
      ['Laptop', 'Electronics', 'New', '999.99'],
      ['Charger', 'Accessories', 'Used', '49.99'],
    ];

    function createTestComponent(options: TextColumnOptions<any>) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [CdkTableModule, TextColumnWithFooter],
        providers: [{provide: TEXT_COLUMN_OPTIONS, useValue: options}],
      });

      fixture = TestBed.createComponent(TextColumnWithFooter);
      component = fixture.componentInstance;
      fixture.detectChanges();

      tableElement = fixture.nativeElement.querySelector('.cdk-table');
    }

    it('should be able to provide a default footer text transformation (function)', () => {
      const expectedFooterPropertyA = 'propertyA!';
      const expectedFooterPropertyB = 'propertyB!';
      const expectedFooterPropertyC = '';
      const expectedFooterPropertyD = '';
      const defaultFooterTextTransform = (name: string) => `${name}!`;
      createTestComponent({defaultFooterTextTransform});

      expectTableToMatchContent(tableElement, [
        ...expectedDefaultTableHeaderAndData,
        [
          expectedFooterPropertyA,
          expectedFooterPropertyB,
          expectedFooterPropertyC,
          expectedFooterPropertyD,
        ],
      ]);
    });

    it('should be able to provide a footer text transformation (function)', () => {
      createTestComponent({});
      const expectedFooterPropertyA = '';
      const expectedFooterPropertyB = '';
      const expectedFooterPropertyC = '';
      const expectedFooterPropertyD = '1049.98';
      // footer text transformation function
      component.getTotal = (): string => {
        const total = component.data
          .map(t => t.propertyD)
          .reduce((acc, value) => (acc || 0) + (value || 0), 0);
        return total ? total.toString() : '';
      };

      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, [
        ...expectedDefaultTableHeaderAndData,
        [
          expectedFooterPropertyA,
          expectedFooterPropertyB,
          expectedFooterPropertyC,
          expectedFooterPropertyD,
        ],
      ]);
    });

    it('should be able to provide a plain footer text', () => {
      createTestComponent({});
      const expectedFooterPropertyA = '';
      const expectedFooterPropertyB = '';
      const expectedFooterPropertyC = 'Total';
      const expectedFooterPropertyD = '';

      component.footerTextPropertyC = 'Total';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expectTableToMatchContent(tableElement, [
        ...expectedDefaultTableHeaderAndData,
        [
          expectedFooterPropertyA,
          expectedFooterPropertyB,
          expectedFooterPropertyC,
          expectedFooterPropertyD,
        ],
      ]);
    });
  });
});

interface TestData {
  propertyA: string;
  propertyB: string;
  propertyC: string;
  propertyD?: number;
}

@Component({
  template: `
    <cdk-table [dataSource]="data">
      <cdk-text-column name="propertyA" [dataAccessor]="dataAccessorA"></cdk-text-column>
      <cdk-text-column name="propertyB" [headerText]="headerTextB"></cdk-text-column>
      <cdk-text-column name="propertyC" [justify]="justifyC"></cdk-text-column>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"></cdk-row>
    </cdk-table>
  `,
  standalone: true,
  imports: [CdkTableModule],
})
class BasicTextColumnApp {
  displayedColumns = ['propertyA', 'propertyB', 'propertyC'];

  data: TestData[] = [
    {propertyA: 'a_1', propertyB: 'b_1', propertyC: 'c_1'},
    {propertyA: 'a_2', propertyB: 'b_2', propertyC: 'c_2'},
  ];

  headerTextB: string;
  footerTextPropertyC: string = '';
  dataAccessorA: (data: TestData) => string;
  justifyC: 'start' | 'end' | 'center' = 'start';
  getTotal() {
    return '';
  }
}

@Component({
  template: `
    <cdk-text-column name="column-a"></cdk-text-column>
  `,
  standalone: true,
  imports: [CdkTableModule],
})
class MissingTableApp {}

@Component({
  template: `
    <cdk-table [dataSource]="data">
      <cdk-text-column [dataAccessor]="dataAccessorA"></cdk-text-column>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"></cdk-header-row>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"></cdk-row>
    </cdk-table>
  `,
  standalone: true,
  imports: [CdkTableModule],
})
class TextColumnWithoutNameApp extends BasicTextColumnApp {}

@Component({
  template: `
    <cdk-table [dataSource]="data">
      <cdk-text-column name="propertyA"/>
      <cdk-text-column name="propertyB"/>
      <cdk-text-column name="propertyC" [footerText]="footerTextPropertyC"/>
      <cdk-text-column name="propertyD" [footerTextTransform]="getTotal"/>

      <cdk-header-row *cdkHeaderRowDef="displayedColumns"/>
      <cdk-row *cdkRowDef="let row; columns: displayedColumns"/>
      <cdk-footer-row *cdkFooterRowDef="displayedColumns"/>
    </cdk-table>
  `,
  standalone: true,
  imports: [CdkTableModule],
})
class TextColumnWithFooter extends BasicTextColumnApp {
  override displayedColumns = ['propertyA', 'propertyB', 'propertyC', 'propertyD'];
  override data = [
    {propertyA: 'Laptop', propertyB: 'Electronics', propertyC: 'New', propertyD: 999.99},
    {propertyA: 'Charger', propertyB: 'Accessories', propertyC: 'Used', propertyD: 49.99},
  ];
}
