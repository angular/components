# Migrating to MDC-based Angular Material Components

In Angular Material v15, many of the components have been rewritten to be based on the official 
[Material Design Components for Web (MDC)](https://github.com/material-components/material-components-web).
The components in the following packages have been rewritten:
* @angular/material/autocomplete
* @angular/material/button
* @angular/material/card
* @angular/material/checkbox
* @angular/material/chips
* @angular/material/core
* @angular/material/dialog
* @angular/material/form-field
* @angular/material/input
* @angular/material/list
* @angular/material/menu
* @angular/material/paginator
* @angular/material/progress-bar
* @angular/material/progress-spinner
* @angular/material/radio
* @angular/material/select
* @angular/material/slide-toggle
* @angular/material/slider
* @angular/material/snack-bar
* @angular/material/table
* @angular/material/tabs
* @angular/material/tooltip

The rewritten components offer several benefits over the old implementations, including:
* Improved accessibility
* Better adherence to the Material Design spec
* Faster adoption of future versions of the Material Design spec, due to being based on common 
  infrastructure

## What has changed?

The new components have different internal DOM and CSS styles. However, the TypeScript APIs and
component/directive selectors for the new components have been kept as close as possible to the old
implementation. This makes it straightforward to migrate your app and get it running with the new
components.

Due to the new DOM and CSS, you will likely find that some styles in your app need to be adjusted,
particularly if your CSS is overriding styles on internal elements on any of the migrated
components.

There are a few components with larger changes to their APIs that were necessary in order to
integrate with MDC. These components include:
* form-field
* chips
* slider
* list

See below for a [detailed list of changes](#Detailed List of Changes) to be aware of for these and
other components.

The old implementation of each new component is now deprecated, but still available under a "legacy"
package. e.g. The old `mat-button` implementation can be used by importing the legacy button module.

```ts
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
```

## How to Migrate

Migrating an existing app to use MDC based components is a tool-assisted migration. The Angular
Material team has built schematics to handle as much of the work as possible. However, some manual
effort will be needed.

You can reduce the amount of manual effort needed by ensuring that your app follows good practices
before migrating.
* Avoid overriding styles on internal Angular Material elements in your CSS as much as possible. If
  you find yourself frequently overriding styles on internal elements, consider using a component
  that is designed for more style customization, such as the ones available in the
  [Angular CDK](/cdk).
* Use [component harnesses](./using-component-harnesses) to interact with Angular Material
  components in tests rather than probing internal elements, properties, or methods of the
  component. Using component harnesses makes your tests easier to understand and more robust to
  changes in Angular Material

### 1. Update to Angular Material v15

Angular Material now includes a schematic to help migrate pre-existing apps to use the new
MDC-based components. To get started, upgrade your app to Angular Material 15.

```shell
ng update @angular/components^15
```

As part of this update, a schematic will run to automatically move your app to use the "legacy"
packages containing the old component implementations. This provides a quick path to getting your
app running on v15 with minimal manual changes.

### 2. Run the MDC Migration Script

After upgrading to v15, you can run the MDC Migration Script to switch from the legacy component
implementations to the new MDC-based ones.

```shell
ng generate # TODO(wagnermaciel): Insert command here.
```

This command will update your app's TypeScript, CSS, and templates to the new implementations,
updating as much as it can automatically.

#### Running a Partial Migration

Depending on the size and complexity of your app, you may want to migrate a single component (or
small group of components) at a time, rather than all at once. 
TODO(wagnermaciel): Add details on this: script params, which components need to move together

You may also want to migrate your app one module at a time instead of all together. It is possible
to use both the old implementation and new implementation in the same app, as long as they aren't
used in the same module. TODO(wagnermaciel): Add detail on this: script params.

### 3. Check for TODOs left by the migration script.

In situations where the script is not able to automatically update your code, it will attempt to add
comments for a human to follow up. These TODO comments follow a common format, so they can be easily
identified.

```ts
// TODO(wagnermaciel): Do we have a common format for all TODOs the script adds?
```

To search for all comments left by the script, search for `TODO(...):` in your IDE, or use the
following grep command.

```shell
grep -lr --exclude-dir=node_modules "TODO(...):"
```

### 4. Verify Your App

After running the migration and addressing the TODOs, manually verify that everything is working
correctly. 

Run your tests and confirm that they pass. It's possible that your tests depended on internal DOM or
async timing details of the old component implementations and may need to be updated. If you find
you need to update some tests, consider using [Component Harnesses](./using-component-harnesses) to
make the tests more robust.

Run your app and verify that the new components look right. Due to the changes in internal DOM and
CSS of the components, you may need to tweak some of your app's styles.

## Detailed List of Changes

### Library-wide Changes
...

### Core CSS & Theming
...

### Autocomplete
...

### Button
...

### Card
...

### Checkbox
...

### Chips
...

### Dialog
...

### Form Field
...

### Input
...

### List
...

### Menu
...

### Option
...

### Paginator
...

### Progress Bar
...

### Progress Spinner
...

### Radio
...

### Select
...

### Slide Toggle
...

### Slider
...

### Snack Bar
...

### Table
...

### Tabs
...

### Tooltip
...
