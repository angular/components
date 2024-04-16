# Material 3 Custom Theme schematic
`ng generate` schematic that helps users to generate a file with a M3 theme
object(s) that is created from predefined color(s) to represent the different M3
color palettes: https://m3.material.io/styles/color/roles. The generated
theme(s) will be called $light-theme and/or $dark-theme. The schematic can be
run with `ng generate @angular/material:m3-theme` and it has the following
options:

* `primaryColor` - Color to use for app's primary color palette (Note: the other
palettes described in the M3 spec will be automatically chosen based on your
primary palette unless specified, to ensure a harmonious color combination).
* `secondaryColor` - Color to use for app's secondary color palette. Defaults to
secondary color generated from Material based on the primary.
* `tertiaryColor` - Color to use for app's tertiary color palette. Defaults to
tertiary color generated from Material based on the primary.
* `neutralColor` - Color to use for app's neutral color palette. Defaults to
neutral color generated from Material based on the primary.
* `directory` - Relative path to a directory within the project that the
generated theme file should be created in. Defaults to the project root.
* `themeTypes` - List of theme types (light and dark) to generate theme(s) for.
Defaults to both light and dark.
