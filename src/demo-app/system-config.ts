/** Type declaration for ambient System. */
declare const System: any;

// Configure the base path and map the different node packages.
System.config({
  paths: {
    'node:*': 'node_modules/*'
  },
  map: {

    // TODO(devversion): replace once the index.ts file for the Material package has been added.
    '@uiux/material': 'dist/packages/material/public-api.js',
    '@uiux/cdk': 'dist/packages/cdk/index.js',

    // Components
    '@uiux/material/component-sample': 'dist/packages/material/component-sample/index.js',

    'rxjs': 'node:rxjs',
    'main': 'main.js',
    'moment': 'node:moment/min/moment-with-locales.min.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/http': 'node:@angular/http/bundles/http.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/router': 'node:@angular/router/bundles/router.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd',
    '@angular/platform-browser':
      'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    // TODO(devversion): replace once the index.ts file for the Material package has been added.
    // '@angular/cdk': 'node:@angular/cdk/bundles/index.js',
    '@angular/cdk/a11y': 'node:@angular/cdk/bundles/cdk-a11y.umd.js',
    '@angular/cdk/bidi': 'node:@angular/cdk/bundles/cdk-bidi.umd.js',
    '@angular/cdk/coercion': 'node:@angular/cdk/bundles/cdk-coercion.umd.js',
    '@angular/cdk/collections': 'node:@angular/cdk/bundles/cdk-collections.umd.js',
    '@angular/cdk/keycodes': 'node:@angular/cdk/bundles/cdk-keycodes.umd.js',
    '@angular/cdk/layout': 'node:@angular/cdk/bundles/cdk-layout.umd.js',
    '@angular/cdk/observers': 'node:@angular/cdk/bundles/cdk-observers.umd.js',
    '@angular/cdk/overlay': 'node:@angular/cdk/bundles/cdk-overlay.umd.js',
    '@angular/cdk/platform': 'node:@angular/cdk/bundles/cdk-platform.umd.js',
    '@angular/cdk/portal': 'node:@angular/cdk/bundles/cdk-portal.umd.js',
    '@angular/cdk/rxjs': 'node:@angular/cdk/bundles/cdk-rxjs.umd.js',
    '@angular/cdk/scrolling': 'node:@angular/cdk/bundles/cdk-scrolling.umd.js',
    '@angular/cdk/stepper': 'node:@angular/cdk/bundles/cdk-stepper.umd.js',
    '@angular/cdk/table': 'node:@angular/cdk/bundles/cdk-table.umd.js',

    '@angular/material': 'node:@angular/material/bundles/material.umd.js',
    '@angular/material/autocomplete': 'node:@angular/material/bundles/material-autocomplete.umd.js',
    '@angular/material/button': 'node:@angular/material/bundles/material-button.umd.js',
    '@angular/material/button-toggle': 'node:@angular/material/bundles/material-button-toggle.umd.js',
    '@angular/material/card': 'node:@angular/material/bundles/material-card.umd.js',
    '@angular/material/checkbox': 'node:@angular/material/bundles/material-checkbox.umd.js',
    '@angular/material/chips': 'node:@angular/material/bundles/material-chips.umd.js',
    '@angular/material/core': 'node:@angular/material/bundles/material-core.umd.js',
    '@angular/material/datepicker': 'node:@angular/material/bundles/material-datepicker.umd.js',
    '@angular/material/dialog': 'node:@angular/material/bundles/material-dialog.umd.js',
    '@angular/material/expansion': 'node:@angular/material/bundles/material-expansion.umd.js',
    '@angular/material/form-field': 'node:@angular/material/bundles/material-form-field.umd.js',
    '@angular/material/grid-list': 'node:@angular/material/bundles/material-grid-list.umd.js',
    '@angular/material/icon': 'node:@angular/material/bundles/material-icon.umd.js',
    '@angular/material/input': 'node:@angular/material/bundles/material-input.umd.js',
    '@angular/material/list': 'node:@angular/material/bundles/material-list.umd.js',
    '@angular/material/menu': 'node:@angular/material/bundles/material-menu.umd.js',
    '@angular/material/paginator': 'node:@angular/material/bundles/material-paginator.umd.js',
    '@angular/material/progress-bar': 'node:@angular/material/bundles/material-progress-bar.umd.js',
    '@angular/material/progress-spinner': 'node:@angular/material/bundles/material-progress-spinner.umd.js',
    '@angular/material/radio': 'node:@angular/material/bundles/material-radio.umd.js',
    '@angular/material/select': 'node:@angular/material/bundles/material-select.umd.js',
    '@angular/material/sidenav': 'node:@angular/material/bundles/material-sidenav.umd.js',
    '@angular/material/slide-toggle': 'node:@angular/material/bundles/material-slide-toggle.umd.js',
    '@angular/material/slider': 'node:@angular/material/bundles/material-slider.umd.js',
    '@angular/material/snack-bar': 'node:@angular/material/bundles/material-snack-bar.umd.js',
    '@angular/material/sort': 'node:@angular/material/bundles/material-sort.umd.js',
    '@angular/material/stepper': 'node:@angular/material/bundles/material-stepper.umd.js',
    '@angular/material/table': 'node:@angular/material/bundles/material-table.umd.js',
    '@angular/material/tabs': 'node:@angular/material/bundles/material-tabs.umd.js',
    '@angular/material/toolbar': 'node:@angular/material/bundles/material-toolbar.umd.js',
    '@angular/material/tooltip': 'node:@angular/material/bundles/material-tooltip.umd.js',
  },
  packages: {
    // Thirdparty barrels.
    'rxjs': {main: 'index'},

    // Set the default extension for the root package, because otherwise the demo-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});
