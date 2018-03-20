Angular Material comes packaged with Angular CLI schematics to make
creating new components easy.

## Install Schematics
Schematics come packaged with Angular Material, so once you have
installed the npm package, they will be available via the Angular CLI.

## Packaged Schematics
Angular Material has 4 schematics it comes packaged with:

- Material Shell
- Navigation
- Dashboard
- Table

### Shell Schematic
The shell schematic will help you quickly add Material to a new project. 
This schematic will:

- Ensure project depedencies in `package.json`
- Ensure project depedencies in your app module
- Add Prebuilt or Setup Custom Theme
- Add Roboto fonts to your index.html
- Apply simple CSS reset to body

```
ng add @angular/material
```

### Navigation Schematic
The navigation schematic will create a new component that includes
a toolbar with the app name and the side nav pre-configured to be
responsive.

```
ng g @angular/material:material-nav
```

### Dashboard Schematic
The dashboard schematic will create a new component that contains
a dynamic grid list of cards.

```
ng g @angular/material:material-dashboard
```

### Table Schematic
The table schematic will create a new table component pre-configured
with a datasource for sorting and pagination.

```
ng g @angular/material:material-table
```
