# Customizing Angular Material component styles

### Styling concepts

There are several questions to keep in mind while customizing the styles of Angular Material
components:

1. Are your styles encapsulated?
2. Are your styles more specific than the defaults?
3. Is the component a child of your component, or does it exist elsewhere in the DOM?
4. Are the styles you wish to modify created by your Angular Material Theme?

##### View encapsulation

By default, Angular component styles are scoped to affect the component's view. This means that
the styles you write will affect all the elements in your component template. They will *not*
affect elements that are children of other components within your template. You can read more
about view encapsulation in the
[Angular documentation](https://angular.io/guide/component-styles#view-encapsulation). You may
also wish to take a look at
[_The State of CSS in Angular_](https://blog.angular.io/the-state-of-css-in-angular-4a52d4bd2700)
on the Angular blog.

##### Selector specificity

Each CSS declaration has a level of *specificity* based on the type and number of selectors used.
More specific styles will take precedence over less specific styles. Angular Material uses the
least specific selectors possible for its components in order to make it easy to override them.
You can read more about specificity and how it is calculated on the
[MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity).

##### Component location

Some Angular Material components, specifically overlay-based ones like MatDialog, MatSnackbar, etc.,
do not exist as children of your component. Often they are injected elsewhere in the DOM. This is
important to keep in mind, since even using high specificity and shadow-piercing selectors will
not target elements that are not direct children of your component. Global styles are recommended
for targeting such components.

##### Customizing Themed Components

Component styles which are dynamic and created by your Angular Material Theme behave differently than 
other styles.  These styles are compiled from `styles.scss` (and any files imported into it), and 
inserted directly into the DOM via `<style>` tags in the `<head>` of your document. This creates an
additional challenge for modifying these styles, as they will override your individual component styles
unless you use more specific selectors than Angular Material.   In practice, the most effective way to modify
these styles is to create your own custom component theme or alternate theme and include it in
your `styles.scss`.  This is true even if you only want to modify a single trait or if the style
in question does not seem directly related to theme colors but is created by the `angular-material-theme` mixin.

You can read about theming components and custom theming [here](https://material.angular.io/guide/theming) and 
[here](https://material.angular.io/guide/theming-your-components).

### Styling overlay components

Overlay-based components have a `panelClass` property (or similar) that can be used to target the
overlay pane. For example, to remove the padding from a dialog:

```scss
// Add this to your global stylesheet after your theme setup
.myapp-no-padding-dialog .mat-dialog-container {
  padding: 0;
}
```

```ts
this.dialog.open(MyDialogComponent, {panelClass: 'myapp-no-padding-dialog'})
```

Since you are adding the styles to your global stylesheet, it is good practice to scope
them appropriately. Try prefixing your selector with your app name or "custom". Also note that
the `mat-dialog-container`'s padding is added by default via a selector with specificity of 1. The
customizing styles have a specificity of 2, so they will always take precedence.

### Styling other components

If your component has view encapsulation turned on (default), your component styles will only
affect the top level children in your template. HTML elements belonging to child components cannot
be targeted by your component styles unless you do one of the following:

- Add the overriding style to your global stylesheet. Scope the selectors so that it only affects
the specific elements you need it to.
- Turn view encapsulation off on your component. If you do this, be sure to scope your styles
appropriately, or else you may end up incidentally targeting other components elswhere in your
application.
- Use a deprecated shadow-piercing descendant combinator to force styles to apply to all the child
elements. Read more about this deprecated solution in the
[Angular documentation](https://angular.io/guide/component-styles#deprecated-deep--and-ng-deep).

