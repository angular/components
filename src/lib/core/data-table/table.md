The CDK data-table displays rows of data with fully customizable cell templates.
Its single responsibility is the efficient rendering of rows in a fully accessible way.

The CDK table provides a foundation upon which other features, such as sorting and pagination,
can be built. Because the CDK table enforces no opinions on these matters, developers have full
control over the interaction patterns associated with the table.

For a Material Design styled table, see <md-table>, which builds on top of the CDK Data Table.

In the near future, the material library will include an additional "simple table",  building
<md-table> with a more minimal interface and sorting, pagination, and selection built-in.


<!-- example(table-basic) -->