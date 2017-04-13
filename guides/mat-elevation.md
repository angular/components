# mat-elevation
mat-elevation exists to give you separation between elements.
All material design elements have resting elevations.
[`Material design`](https://material.io/guidelines/material-design/elevation-shadows.html)
explains how best to use elevation.


Elevation is implemented with a class, simply adding the class `mat-elevation-z#` where # is the elevation number you want, 0-24.

## Example
<!-- example(elevation-overview) -->


## Mixins
In order to use the mixin for Elevation you must 
`@import '~@angular/material/theming';`
$zValue must be a value between 0 and 24, inclusive.
`@include mat-elevation($zValue);`


How to use the mixin 
```scss
.myClass {
  @include mat-elevation(2);

  &:active {
    @include mat-elevation(8);
  }
}
```

## Deprecated
The `mdElevation($zValue)` directive is deprecated.