`<mat-toolbar>` is a container for headers, titles, or actions.

<!-- example(toolbar-overview) -->

### Single row

In the simplest case, a toolbar may be placed at the top of your application and 
have a single row that includes the title of your application.

<!-- example(toolbar-simple) -->

### Multiple rows

The Material Design spec used to describe toolbars with multiple rows. This can 
be done by placing `<mat-toolbar-row>` elements inside a `<mat-toolbar>`.

<!-- example({"example":"toolbar-multirow",
              "file":"toolbar-multirow-example.html", 
              "region":"toolbar-row"}) -->

**Note**: Placing content outside a `<mat-toolbar-row>` when multiple rows are specified is not
supported.

### Positioning toolbar content
The toolbar does not perform any positioning of its content. This gives the user full power to 
position the content as it suits their application.

A common pattern is to position a title on the left with some actions on the right. This can be
easily accomplished with `display: flex`:

<!-- example({"example":"toolbar-multirow",
              "file":"toolbar-multirow-example.html", 
              "region":"toolbar-position-content"}) -->
              
<!-- example({"example":"toolbar-multirow",
              "file":"toolbar-multirow-example.css", 
              "region":"toolbar-position-content-style"}) -->

### Accessibility
By default, the toolbar assumes that it will be used in a purely decorative fashion and thus sets
no roles, ARIA attributes, or keyboard shortcuts. This is equivalent to having a sequence of `<div>`
elements on the page.

Generally, the toolbar is used as a header where `role="heading"` would be appropriate.

Only if the use-case of the toolbar match that of role="toolbar", the user should add the role and
an appropriate label via `aria-label` or `aria-labelledby`.
