# md-elevation

md-elevation exists to give you seperation between elements.
All material design elements have resting elevations.

In Angular material the elevation is implemented with a class.

simply adding the class `md-elevation`


# Examples



# Mixins
_elevation.scss
$zValue must be a value between 0 and 24, inclusive.
  `@include mat-elevation($zValue);`


How to use the mixin 
`.myClass {
   @include $mat-elevation(2);

   &:active {
     @include $mat-elevation(8);
   }
}`

# Depercated
The use of `mdElevation($zValue)` is depercated.