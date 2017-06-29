The CDK Data Table displays rows of data with fully customizable cell templates.
Its single responsibility is the efficient rendering of rows in a fully accessible way.

The CDK table provides a foundation upon which other features, such as sorting and pagination, can be built.
Because the CDK table enforces no opinions on these matters, developers have full control over the interaction patterns associated with the table.

For a Material Design styled table, see `<md-table>`, which builds on top of the CDK Data Table.

In the near future, the material library will include an additional "simple table",
building  `<md-table>` with a more minimal interface and sorting, pagination, and selection built-in.

<!-- example(table-basic) -->

## Using the CDK Data Table

### Writing your table template

The first step to writing the CDK Data Table template is to define the columns that will be used in your table.
Each column definition will consist of a header cell template and a data cell template by using
the `<cdk-header-cell>` and `<cdk-cell>`, respectively. These will be wrapped in an `<ng-container>` and given a column name.

Both the `<cdk-header-cell>` and `<cdk-cell>` require an additional directive so that the table can
capture the inner template. For `<cdk-header-cell>` you must include the attribute `*cdkHeaderCellDef`
and for `<cdk-cell>` you must include `*cdkCellDef`. Note that the `*cdkCellDef` provides an outlet
to capture the cell’s row data to be used in the template.

```html
    <ng-container cdkColumnDef="column_a">
      <cdk-header-cell *cdkHeaderCellDef> Column A </cdk-header-cell>
      <cdk-cell *cdkCellDef="let row"> {{row.a}} </cdk-cell>
    </ng-container>
```

After the columns have been defined, you must include a `<cdk-header-row>` and `<cdk-row>` which will
each take an array of the column names. This will be the columns that will be rendered in the table and in the order provided.

```html
    <cdk-header-row *cdkHeaderRowDef="['column_a', 'column_b', 'column_c']"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_a', 'column_b', 'column_c']"></cdk-row>
```

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

    <!-- Header and Row Declarations (define columns; provide attribute and event binding) -->
    <cdk-header-row *cdkHeaderRowDef="['column_a', 'column_b', 'column_c']"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_a', 'column_b', 'column_c']"></cdk-row>
  </cdk-table>
```

It is not required to display all the columns that are defined within the template,
nor is the order required. For example, if we wanted the table to display only Column B
and Column A and in that order, then the template would look like this:

```html
    <cdk-header-row *cdkHeaderRowDef="['column_b', 'column_a’]"></cdk-header-row>
    <cdk-row *cdkRowDef="let row; columns: ['column_b', 'column_a']"></cdk-row>
```

Adding attribute and event binding to the header and rows is as simple as applying them to the
<cdk-header-row> and <cdk-row>. For example, here the table is adding a click handler to both.
In addition, the CSS class `a-bigger-than-twenty` will be applied to any row where its data’s `a` property is greater than 20.

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
cause the table to re-render to reflect those changes. For more information, see Dynamic Columns below under Features.

### Connecting the table to a data source
Data is provided to the table through the `DataSource` interface. When the table receives a DataSource,
it calls its connect function to receive an observable that emits an array of data. Whenever the Data Source emits data to this stream, the table will use it to render its rows.

Since the Data Source provides this data stream, it is responsible for watching for data changes
and notifying the table when to re-render. Examples of these data changes includes sorting, pagination, filtering, and more.
To see how these examples can be incorporated in the Data Source, see below under Features.

Note that a trackBy function can be provided to the table similar to Angular’s ngFor trackBy.
This allows you to customize how the table to identifies rows and improves performance.

In the future, the connect function will be able to use the CollectionViewer parameter to be
notified about table events, such as what rows the user is currently viewing. This could be used to
help the Data Source know what data does not need to be retrieved and rendered, further improving performance.

## Material Table
To use the CDK Data Table with styles matching the Material Design spec, you can use the `<md-table>`
defined in `@angular/material`.  This will build on the CDK Data Table and apply built-in Material Design styles.

The interface for the `<md-table>` matches the `<cdk-table>`, except that its element selectors
will be prefixed with `md-` instead of `cdk-`.

Note that the column definition directives (`cdkColumnDef` and `cdkHeaderCellDef`) are still prefixed with `cdk-`.

```html
<md-table [dataSource]="dataSource">
    <!-- Column A Definition -->
    <ng-container cdkColumnDef="column_a">
      <md-header-cell *cdkHeaderCellDef> Column A </md-header-cell>
      <md-cell *cdkCellDef="let row"> {{row.a}} </md-cell>
    </ng-container>

    <!-- Column B Definition -->
    <ng-container cdkColumnDef="column_b">
      <md-header-cell *cdkHeaderCellDef> Column B </md-header-cell>
      <md-cell *cdkCellDef="let row"> {{row.b}} </md-cell>
    </ng-container>

    <!-- Column C Definition -->
    <ng-container cdkColumnDef="column_c">
      <md-header-cell *cdkHeaderCellDef> Column C </md-header-cell>
      <md-cell *cdkCellDef="let row"> {{row.c}} </md-cell>
    </ng-container>

    <!-- Header and Row Declarations (define columns; provide attribute and event binding) ->
    <md-header-row *cdkHeaderRowDef="['column_a', 'column_b', 'column_c']"></md-header-row>
    <md-row *cdkRowDef="let row; columns: ['column_a', 'column_b', 'column_c']"></md-row>
  </md-table>
```

## Simple Table

In the near future, we would like to provide a simple version of the data table that includes an easy-to-use interface,
material styling, data array input, and out-of-the-box features such as sorting, pagination, and selection.

## Features

The CDK Table’s responsibility is to handle efficient rendering of rows and it’s the Data Source’s job
to let the table know what data should be rendered. As such, features that manipulate what data should
be rendered should be the responsibility of the data source.

### Pagination
Use the MdPagination component to add data paging to the data table. The data source can listen to
paging events from the component and appropriately slice the right data from whatever data provider
is used. Sending this new data to the table will cause it to render the new page of data.

<!-- example(table-pagination) -->
