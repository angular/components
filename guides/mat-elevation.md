# mat-elevation
mat-elevation exists to give you seperation between elements.
All material design elements have resting elevations.
[`Material design`](https://material.io/guidelines/material-design/elevation-shadows.html)
explains how best to use elevation.


Elevation is implemented with a class, simply adding the class `mat-elevation`

# Example
<!-- example(elevation-overview) -->


# Mixins
_elevation.scss
$zValue must be a value between 0 and 24, inclusive.
  `@include mat-elevation($zValue);`


How to use the mixin 
` .myClass {
   @include $mat-elevation(2);

   &:active {
     @include $mat-elevation(8);
   }
}
`

# Depercated
The use of `mdElevation($zValue)` is depercated.