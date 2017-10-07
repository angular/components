/** Type declaration for ambient System. */
declare const System: any;

// Apply the CLI SystemJS configuration.
System.config({
  paths: {
    'node:*': 'node_modules/*',
  },
  map: {
    'rxjs': 'node:rxjs',
    'main': 'main.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/bundles/core.umd.js',
    '@angular/common': 'node:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/http': 'node:@angular/http/bundles/http.umd.js',
    '@angular/forms': 'node:@angular/forms/bundles/forms.umd.js',
    '@angular/router': 'node:@angular/router/bundles/router.umd.js',
    '@angular/animations': 'node:@angular/animations/bundles/animations.umd.js',
    '@angular/animations/browser': 'node:@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser': 'node:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser/animations':
      'node:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
    '@angular/platform-browser-dynamic':
      'node:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',

    '@uiux/material': 'dist/bundles/material.umd.js',
    '@uiux/cdk': 'dist/bundles/cdk.umd.js',
    '@uiux/cdk/a11y': 'dist/bundles/cdk-a11y.umd.js',
    '@uiux/cdk/bidi': 'dist/bundles/cdk-bidi.umd.js',
    '@uiux/cdk/coercion': 'dist/bundles/cdk-coercion.umd.js',
    '@uiux/cdk/collections': 'dist/bundles/cdk-collections.umd.js',
    '@uiux/cdk/keycodes': 'dist/bundles/cdk-keycodes.umd.js',
    '@uiux/cdk/layout': 'dist/bundles/cdk-layout.umd.js',
    '@uiux/cdk/observers': 'dist/bundles/cdk-observers.umd.js',
    '@uiux/cdk/overlay': 'dist/bundles/cdk-overlay.umd.js',
    '@uiux/cdk/platform': 'dist/bundles/cdk-platform.umd.js',
    '@uiux/cdk/portal': 'dist/bundles/cdk-portal.umd.js',
    '@uiux/cdk/rxjs': 'dist/bundles/cdk-rxjs.umd.js',
    '@uiux/cdk/scrolling': 'dist/bundles/cdk-scrolling.umd.js',
    '@uiux/cdk/stepper': 'dist/bundles/cdk-stepper.umd.js',
    '@uiux/cdk/table': 'dist/bundles/cdk-table.umd.js',
    '@uiux/cdk/testing': 'dist/bundles/cdk-testing.umd.js',
    '@uiux/material-examples': 'dist/bundles/material-examples.umd.js',

    '@uiux/material/autocomplete': 'dist/bundles/material-autocomplete.umd.js',
    '@uiux/material/button': 'dist/bundles/material-button.umd.js',
    '@uiux/material/button-toggle': 'dist/bundles/material-button-toggle.umd.js',
    '@uiux/material/card': 'dist/bundles/material-card.umd.js',
    '@uiux/material/checkbox': 'dist/bundles/material-checkbox.umd.js',
    '@uiux/material/chips': 'dist/bundles/material-chips.umd.js',
    '@uiux/material/core': 'dist/bundles/material-core.umd.js',
    '@uiux/material/datepicker': 'dist/bundles/material-datepicker.umd.js',
    '@uiux/material/dialog': 'dist/bundles/material-dialog.umd.js',
    '@uiux/material/expansion': 'dist/bundles/material-expansion.umd.js',
    '@uiux/material/form-field': 'dist/bundles/material-form-field.umd.js',
    '@uiux/material/grid-list': 'dist/bundles/material-grid-list.umd.js',
    '@uiux/material/icon': 'dist/bundles/material-icon.umd.js',
    '@uiux/material/input': 'dist/bundles/material-input.umd.js',
    '@uiux/material/list': 'dist/bundles/material-list.umd.js',
    '@uiux/material/menu': 'dist/bundles/material-menu.umd.js',
    '@uiux/material/paginator': 'dist/bundles/material-paginator.umd.js',
    '@uiux/material/progress-bar': 'dist/bundles/material-progress-bar.umd.js',
    '@uiux/material/progress-spinner': 'dist/bundles/material-progress-spinner.umd.js',
    '@uiux/material/radio': 'dist/bundles/material-radio.umd.js',
    '@uiux/material/select': 'dist/bundles/material-select.umd.js',
    '@uiux/material/sidenav': 'dist/bundles/material-sidenav.umd.js',
    '@uiux/material/slide-toggle': 'dist/bundles/material-slide-toggle.umd.js',
    '@uiux/material/slider': 'dist/bundles/material-slider.umd.js',
    '@uiux/material/snack-bar': 'dist/bundles/material-snack-bar.umd.js',
    '@uiux/material/sort': 'dist/bundles/material-sort.umd.js',
    '@uiux/material/stepper': 'dist/bundles/material-stepper.umd.js',
    '@uiux/material/table': 'dist/bundles/material-table.umd.js',
    '@uiux/material/tabs': 'dist/bundles/material-tabs.umd.js',
    '@uiux/material/toolbar': 'dist/bundles/material-toolbar.umd.js',
    '@uiux/material/tooltip': 'dist/bundles/material-tooltip.umd.js',
  },
  packages: {
    // Thirdparty barrels.
    'rxjs': { main: 'index' },
    // Set the default extension for the root package, because otherwise the demo-app can't
    // be built within the production mode. Due to missing file extensions.
    '.': {
      defaultExtension: 'js'
    }
  }
});
