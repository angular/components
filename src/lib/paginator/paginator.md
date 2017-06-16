`<md-paginator>` is a navigation for pages information, typically used with a data-table.

<!-- example(pagination-overview) -->

### Basic use
Each paginator instance requires:
* The current page index
* The number of items per page
* The total number of items being paged

When the user interacts with the paginator, a `PageEvent` will be fired that can be used to update
any associated data view.

### Page size options
The paginator displays a dropdown of page sizes for the user to choose from. The options for this
dropdown can be set via `pageSizeOptions`

### Internationalization
The labels for the paginator can be customized by providing your own instance of `MdPaginatorIntl`.
This will allow you to change the following:
 1. The label for the length of each page.
 2. The range text displayed to the user.
 3. The tooltip messages on the navigation buttons.
