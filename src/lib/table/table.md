The `md-table` provides a Material Design styled data table that can be used to display rows of data.

This table builds on the foundation of the CDK data-table and uses a similar interface for its
data source input and template, except that its element selectors will be prefixed with `md-` instead of `cdk-`.

<!-- example(table-basic) -->

Note that the column definition directives (`cdkColumnDef` and `cdkHeaderCellDef`) are still prefixed with `cdk-`.

For more information on the interface and how it works, see the guide covering the CDK data-table.

## Simple Table

In the near future, we would like to provide a simple version of the data table that includes an easy-to-use interface,
material styling, data array input, and out-of-the-box features such as sorting, pagination, and selection.

## Features

Adding features on top of the `md-table` such as sorting and pagination can be done by merging 
events within the data source and sending the updated data to the table through the stream provided
in the `connect` function.

### Pagination

Use the `md-pagination` component to add data paging to the table. The data source can listen to
paging events from the component and appropriately slice the right data from whatever data provider
is used. Sending this new data to the table will cause it to render the new page of data.

<!-- example(table-pagination) -->

### Sorting
Use the `mdSort` directive and `md-sort-header` component to enable sorting on the table through
the column headers. The data source can listen to sorting events from the component and sort the data 
before giving it to the table to render.

<!-- example(table-sorting) -->

### Filtering

Apply filtering to your table's data by listening to an input's changes.
When a change occurs, filter the data in the data source and send it to the table to render.

<!--- example(table-filtering) -->