To add sorting behavior and styling to a set of table headers, add the `<md-sort-header>` component
to each header and provide an `id` that will identify it. These headers should be contained within a
parent element with the `mdSort` directive, which will emit an `mdSortChange` event when the user
 triggers sorting on the header.

Users can trigger the sort header through a mouse click or keyboard action. When this happens, the
`mdSort` will emit an `mdSortChange` event that contains the ID of the header triggered and the
direction to sort (`asc` or `desc`)

By default, a sort header starts its sorting at `asc` and then `desc`. Triggering the sort header
after `desc` will remove sorting.

### Changing the sort order

To reverse the sort order for all headers, set the `mdSortStart` to `desc` on the `mdSort` directive.
To reverse the order only for a specific header, set the `start` input only on the header instead.

To prevent the user from removing sort altogether after it is applied, set `mdSortDisableClear` to
`true` on the `mdSort` to affect all headers, or set `disableClear` to `true` on a specific header.
