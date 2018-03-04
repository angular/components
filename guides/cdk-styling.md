# CDK Styling
The CDK (Component Development Kit) is meant to be a starting place for developers to build their your own components, the same way it is for Angular Material. It contains base components, helpful tools, and is purposely un-opinionated when it comes to visual styles.

## Prebuilt CSS

Though the CDK leaves most styling up to the developer, in some cases it is necessary to have styling to define or demonstrate a component. When necessary the CDK provides styles for this reason.

### Overlay

In order for the overlay in the CDK to work correctly you need to include the prebuilt overlay styles. 

You can reference the styles in a SASS file like this.
```scss
@import "~@angular/cdk/overlay-prebuilt.css"
```
Or you can reference the CSS in an HTML file like this.

```html
<link href="node_modules/@angular/cdk/overlay-prebuilt.css" rel="stylesheet">
```

