The CDK data-table displays rows of data with fully customizable cell templates.
Its single responsibility is the efficient rendering of rows in a fully accessible way.

The table provides a foundation upon which other features, such as sorting and pagination, can be built.
Because it enforces no opinions on these matters, developers have full control over the interaction patterns associated with the table.

For a Material Design styled table, see the documentation for `<md-table>` which builds on top of the CDK data-table.

In the near future, the material library will include an additional "simple table",
building `<md-table>` with a more minimal interface and sorting, pagination, and selection built-in.

## Using the CDK Data Table

### Writing your table template

The first step to writing the data-table template is to define the columns.
A column definition is specified via an `<ng-container>` with the `cdkColumnDef` directive, giving
column a name. Each column definition then contains further definitions for both a header-cell
template (`cdkHeaderCellDef`) and a data-cell template (`cdkCellDef`).


```html
    <ng-container cdkColumnDef="column_a">
      <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
      <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
    </ng-container>
```

Note that `cdkCellDef` exports the row context such that the row data (and additional fields) can
be referenced in the cell template.

The next step is to define the table's header-row (`cdkHeaderRowDef`) and data-row (`cdkRowDef`). 
Each should be provided a list of which columns should be rendered and in which order.

```html
    <cdk-header-row *cdkHeaderRowDef="['column_a', 'column_b', 'column_c']"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_a', 'column_b', 'column_c']"></cdk-row>
```

Note that `cdkRowDef` also exports row context, which can be used to apply event and attribute
bindings that use the row data (and additional fields).

In the following template, we have a data table that displays three columns: Column A, Column B, and Column C.
The <cdk-header-row> and <cdk-row> are given an input of what columns to display.

```html
<cdk-table [dataSource]="dataSource">
    <!-- Column A Definition -->
    <ng-container cdkColumnDef="column_a">
      <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
      <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
    </ng-container>

    <!-- Column B Definition -->
    <ng-container cdkColumnDef="column_b">
      <cdk-header-cell *cdkHeaderCellDef> Column B </cdk-header-cell>
      <cdk-cell *cdkCellDef="let row"> {{row.b}} </cdk-cell>
    </ng-container>

    <!-- Column C Definition -->
    <ng-container cdkColumnDef="column_c">
      <cdk-header-cell *cdkHeaderCellDef> Column C </cdk-header-cell>
      <cdk-cell *cdkCellDef="let row"> {{row.c}} </cdk-cell>
    </ng-container>

    <!-- Header and Row Declarations -->
    <cdk-header-row *cdkHeaderRowDef="['column_a', 'column_b', 'column_c']"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_a', 'column_b', 'column_c']"></cdk-row>
  </cdk-table>
```

Note that it is not required to display all the columns that are defined within the template,
nor use the same ordering. For example, to display the table with only Column B
and Column A and in that order, then the row and header definitions would be written as:

```html
    <cdk-header-row *cdkHeaderRowDef="['column_b', 'column_a’]"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_b', 'column_a']"></cdk-row>
```

Adding attribute and event binding to the header and rows is as simple as applying them to the
`<cdk-header-row>` and `<cdk-row>`. For example, here the table is adding a click handler to both.
In addition, the CSS class `a-bigger-than-twenty` will be applied to any row where its data’s `a`
property is greater than 20.

```html
    <cdk-header-row *cdkHeaderRowDef="['column_b', 'column_a']"
                    (click)=”handleHeaderRowClick(row)”>
    </cdk-header-row>

    <cdk-row *cdkRowDef="let row; columns: ['column_b', 'column_a']"
             [class.a-bigger-than-twenty]=”row.a > 20”
             (click)=”handleRowClick(row)”>
    </cdk-row>
```

Changing the list of columns provided to the `<cdk-header-row>` and `<cdk-row>` will automatically
cause the table to re-render to reflect those changes.

### Connecting the table to a data source
Data is provided to the table through the `DataSource` interface. When the table receives a DataSource,
it calls the DataSource's connect function which returns an observable that emits an array of data. 
Whenever the Data Source emits data to this stream, the table will use it to render its rows.

Since the Data Source provides this data stream, it is responsible for watching for data changes
and notifying the table when to re-render. Examples of these data changes includes sorting, pagination, 
filtering, and more.

To improve performance, a trackBy function can be provided to the table similar to Angular’s ngFor trackBy.
This allows you to customize how the table to identifies rows and helps it to understand how
the data is changing.

In the future, the connect function will be able to use the CollectionViewer parameter to be
notified about table events, such as what rows the user is currently viewing. This could be used to
help the Data Source know what data does not need to be retrieved and rendered, further improving performance.