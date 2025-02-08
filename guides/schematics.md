# Installation and Code Generation

Angular Material comes packaged with Angular CLI schematics to make
creating Material applications easier.

## Install Schematics

Schematics are included with both `@angular/cdk` and `@angular/material`. Once you install the npm
packages, they will be available through the Angular CLI.

Using the command below will install Angular Material, the [Component Dev Kit](https://material.angular.io/cdk) (CDK),
and [Angular Animations](https://angular.dev/guide/animations) in your project. Then it will run the
installation schematic.

```
ng add @angular/material
```

In case you just want to install the `@angular/cdk`, there are also schematics for the [Component Dev Kit](https://material.angular.io/cdk)

```
ng add @angular/cdk
```

The Angular Material `ng add` schematic helps you set up an Angular CLI project that uses Material.
See the [`getting started guide](./getting-started#install-angular-material) for more information.

Running `ng add` will:

- Ensure project dependencies are placed in `package.json`
- Enable the BrowserAnimationsModule in your app module
- Add either a prebuilt theme or a custom theme
- Add Roboto fonts to your `index.html`
- Add the Material Symbols font to your `index.html`
- Add global styles to
  - Remove margins from `body`
  - Set `height: 100%` on `html` and `body`
  - Make Roboto the default font of your app


## Component schematics

In addition to the installation schematic, Angular Material comes with multiple schematics that can be
used to easily generate Material Design components:


| Name           | Description                                                                                            |
|----------------|--------------------------------------------------------------------------------------------------------|
| `address-form` | Component with a form group that uses Material Design form controls to prompt for a shipping address   |
| `navigation`   | Creates a component with a responsive Material Design sidenav and a toolbar for showing the app name   |
| `dashboard`    | Component with multiple Material Design cards and menus which are aligned in a grid layout             |
| `table`        | Generates a component with a Material Design data table that supports sorting and pagination           |
| `tree`         | Component that interactively visualizes a nested folder structure by using the `<mat-tree>` component  |


Additionally, the Angular CDK also comes with a collection of component schematics:


| Name           | Description                                                                                        |
|----------------|----------------------------------------------------------------------------------------------------|
| `drag-drop`    | Component that uses the `@angular/cdk/drag-drop` directives for creating an interactive to-do list |

### Address form schematic

Running the `address-form` schematic generates a new Angular component that can be used to get
started with a Material Design form group consisting of:

* Material Design form fields
* Material Design radio controls
* Material Design buttons

```
ng generate @angular/material:address-form <component-name>
```

### Navigation schematic

The `navigation` schematic will create a new component that includes
a toolbar with the app name, and a responsive side nav based on Material
breakpoints.

```
ng generate @angular/material:navigation <component-name>
```

### Table schematic

The table schematic will create a component that renders an Angular Material `<table>` which has
been pre-configured with a datasource for sorting and pagination.

```
ng generate @angular/material:table <component-name>
```

### Dashboard schematic

The `dashboard` schematic will create a new component that contains
a dynamic grid list of Material Design cards.

```
ng generate @angular/material:dashboard <component-name>
```

### Tree schematic

The `tree` schematic can be used to quickly generate an Angular component that uses the Angular
Material `<mat-tree>` component to visualize a nested folder structure.

```
ng generate @angular/material:tree <component-name>
```

### Drag and Drop schematic

The `drag-drop` schematic is provided by the `@angular/cdk` and can be used to generate a component
that uses the CDK drag and drop directives.

```
ng generate @angular/cdk:drag-drop <component-name>
```

### Material 3 Theme schematic

The `theme-color` schematic will generate a file with Material 3 palettes from the specified colors
that can be used in a theme file. It also generates high contrast color override mixins if
specified.

```
ng generate @angular/material:theme-color
```

Learn more about this schematic in its [documentation](https://github.com/angular/components/blob/main/src/material/schematics/ng-generate/theme-color/README.md).
