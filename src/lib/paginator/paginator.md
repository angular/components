`<md-paginator>` is a component that provides navigation between paged information. It supports
 the changing of page length as well as giving the user buttons to navigate to the previous or next
 page.

<!-- example(pagination-overview) -->

To use the paginator, you must provide the total length of the pagination information list and
the length of each page. To allow the end-user to change the page length list, you may optionally
input an array of numbers that the user may select from.

Additionally you may provide an input of what the current page index should be. Note that
a non-zero index will be interpretted to display the first page, whereas if the page index is beyond
the max number of pages, then this will be reflected to the user (e.g. `140 - 149 of 100 items`).

When the user changes the page length, or navigates between pages, the paginator will output a
`PageChangeEvent` that contains the paginator's context, including the list length,

### Internationalization
In order to support internationalization or customization of the displayed text, the paginator
supports an injection of a custom class that extends `MdPaginatorIntl`. This will allow you to
change the following:
 1. The label for the length of each page.
 2. The range text displayed to the user.
 3. The tooltip messages on the navigation buttons.
