/** Type declaration for ambient System. */
declare const System: any;

// Configure the base path and map the different node packages.
System.config({
  paths: {
    'node:*': 'node_modules/*'
  },
  map: {
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
    '@uiux/material': 'dist/packages/material/public-api.js',
    '@uiux/cdk': 'dist/packages/cdk/index.js',
    '@uiux/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
    '@uiux/cdk/bidi': 'dist/packages/cdk/bidi/index.js',
    '@uiux/cdk/coercion': 'dist/packages/cdk/coercion/index.js',
    '@uiux/cdk/collections': 'dist/packages/cdk/collections/index.js',
    '@uiux/cdk/keycodes': 'dist/packages/cdk/keycodes/index.js',
    '@uiux/cdk/layout': 'dist/packages/cdk/layout/index.js',
    '@uiux/cdk/observers': 'dist/packages/cdk/observers/index.js',
    '@uiux/cdk/overlay': 'dist/packages/cdk/overlay/index.js',
    '@uiux/cdk/platform': 'dist/packages/cdk/platform/index.js',
    '@uiux/cdk/portal': 'dist/packages/cdk/portal/index.js',
    '@uiux/cdk/rxjs': 'dist/packages/cdk/rxjs/index.js',
    '@uiux/cdk/scrolling': 'dist/packages/cdk/scrolling/index.js',
    '@uiux/cdk/stepper': 'dist/packages/cdk/stepper/index.js',
    '@uiux/cdk/table': 'dist/packages/cdk/table/index.js',

    '@uiux/material/autocomplete': 'dist/packages/material/autocomplete/index.js',
    '@uiux/material/button': 'dist/packages/material/button/index.js',
    '@uiux/material/button-toggle': 'dist/packages/material/button-toggle/index.js',
    '@uiux/material/card': 'dist/packages/material/card/index.js',
    '@uiux/material/checkbox': 'dist/packages/material/checkbox/index.js',
    '@uiux/material/chips': 'dist/packages/material/chips/index.js',
    '@uiux/material/core': 'dist/packages/material/core/index.js',
    '@uiux/material/datepicker': 'dist/packages/material/datepicker/index.js',
    '@uiux/material/dialog': 'dist/packages/material/dialog/index.js',
    '@uiux/material/expansion': 'dist/packages/material/expansion/index.js',
    '@uiux/material/form-field': 'dist/packages/material/form-field/index.js',
    '@uiux/material/grid-list': 'dist/packages/material/grid-list/index.js',
    '@uiux/material/icon': 'dist/packages/material/icon/index.js',
    '@uiux/material/input': 'dist/packages/material/input/index.js',
    '@uiux/material/list': 'dist/packages/material/list/index.js',
    '@uiux/material/menu': 'dist/packages/material/menu/index.js',
    '@uiux/material/paginator': 'dist/packages/material/paginator/index.js',
    '@uiux/material/progress-bar': 'dist/packages/material/progress-bar/index.js',
    '@uiux/material/progress-spinner': 'dist/packages/material/progress-spinner/index.js',
    '@uiux/material/radio': 'dist/packages/material/radio/index.js',
    '@uiux/material/select': 'dist/packages/material/select/index.js',
    '@uiux/material/sidenav': 'dist/packages/material/sidenav/index.js',
    '@uiux/material/slide-toggle': 'dist/packages/material/slide-toggle/index.js',
    '@uiux/material/slider': 'dist/packages/material/slider/index.js',
    '@uiux/material/snack-bar': 'dist/packages/material/snack-bar/index.js',
    '@uiux/material/sort': 'dist/packages/material/sort/index.js',
    '@uiux/material/stepper': 'dist/packages/material/stepper/index.js',
    '@uiux/material/table': 'dist/packages/material/table/index.js',
    '@uiux/material/tabs': 'dist/packages/material/tabs/index.js',
    '@uiux/material/toolbar': 'dist/packages/material/toolbar/index.js',
    '@uiux/material/tooltip': 'dist/packages/material/tooltip/index.js',
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
