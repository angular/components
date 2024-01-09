import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

function defineTest(
  description: string,
  inputs: {[filename: string]: string},
  expected: {[filename: string]: string},
) {
  it(description, async () => {
    const PATH = 'projects/cdk-testing/';
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v17',
      MIGRATION_PATH,
      [],
    );

    for (const filename in inputs) {
      writeFile(PATH + filename, inputs[filename]);
    }

    await runFixers();

    for (const filename in expected) {
      const actual = appTree.readContent(PATH + filename);
      // Jasmine's expect(...).toBe(...) doesn't show us the full output.
      if (actual != expected[filename]) {
        fail(['\nActual:', actual, 'Expected:', expected[filename]].join('\n'));
      }
    }
  });
}

describe('theme base mixins migration', () => {
  defineTest(
    'should add base if color found',
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();
      @include mat.button-color($theme);
      `,
    },
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();

      // The following mixins include base theme styles that are only needed once per application. These
      // theme styles do not depend on the color, typography, or density settings in your theme. However,
      // these styles may differ depending on the theme's design system. Currently all themes use the
      // Material 2 design system, but in the future it may be possible to create theme based on other
      // design systems, such as Material 3.
      //
      // Please note: you do not need to include the 'base' mixins, if you include the corresponding
      // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
      //
      // To learn more about "base" theme styles visit our theming guide:
      // https://material.angular.io/guide/theming#theming-dimensions
      //
      // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
      // your theme to them. This will ensure the correct values for your app are included.
      @include mat.button-base(/* TODO(v17): pass $your-theme here */);

      @include mat.button-color($theme);
      `,
    },
  );

  defineTest(
    'should add base if typography found',
    {
      'global.scss': `
      @use '@angular/material';
      $theme: ();
      @include material.all-component-typographies($theme);
      @include material.core();
      `,
    },
    {
      'global.scss': `
      @use '@angular/material';
      $theme: ();
      @include material.all-component-typographies($theme);
      @include material.core();

      // The following mixins include base theme styles that are only needed once per application. These
      // theme styles do not depend on the color, typography, or density settings in your theme. However,
      // these styles may differ depending on the theme's design system. Currently all themes use the
      // Material 2 design system, but in the future it may be possible to create theme based on other
      // design systems, such as Material 3.
      //
      // Please note: you do not need to include the 'base' mixins, if you include the corresponding
      // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
      //
      // To learn more about "base" theme styles visit our theming guide:
      // https://material.angular.io/guide/theming#theming-dimensions
      //
      // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
      // your theme to them. This will ensure the correct values for your app are included.
      @include material.all-component-bases(/* TODO(v17): pass $your-theme here */);

      `,
    },
  );

  defineTest(
    'should add base if density found',
    {
      'global.scss': `
      @use "@angular/material" as mat;
      @include mat.core ;
      @include mat.checkbox-density(maximum);
      @include mat.card-density(-3);
      `,
    },
    {
      'global.scss': `
      @use "@angular/material" as mat;
      @include mat.core ;

      // The following mixins include base theme styles that are only needed once per application. These
      // theme styles do not depend on the color, typography, or density settings in your theme. However,
      // these styles may differ depending on the theme's design system. Currently all themes use the
      // Material 2 design system, but in the future it may be possible to create theme based on other
      // design systems, such as Material 3.
      //
      // Please note: you do not need to include the 'base' mixins, if you include the corresponding
      // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
      //
      // To learn more about "base" theme styles visit our theming guide:
      // https://material.angular.io/guide/theming#theming-dimensions
      //
      // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
      // your theme to them. This will ensure the correct values for your app are included.
      @include mat.card-base(/* TODO(v17): pass $your-theme here */);
      @include mat.checkbox-base(/* TODO(v17): pass $your-theme here */);

      @include mat.checkbox-density(maximum);
      @include mat.card-density(-3);
      `,
    },
  );

  defineTest(
    'should not add all-components-bases and individual bases',
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();
      @include mat.all-component-colors($theme);
      @include mat.button-typography($theme);
      `,
    },
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();

      // The following mixins include base theme styles that are only needed once per application. These
      // theme styles do not depend on the color, typography, or density settings in your theme. However,
      // these styles may differ depending on the theme's design system. Currently all themes use the
      // Material 2 design system, but in the future it may be possible to create theme based on other
      // design systems, such as Material 3.
      //
      // Please note: you do not need to include the 'base' mixins, if you include the corresponding
      // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
      //
      // To learn more about "base" theme styles visit our theming guide:
      // https://material.angular.io/guide/theming#theming-dimensions
      //
      // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
      // your theme to them. This will ensure the correct values for your app are included.
      @include mat.all-component-bases(/* TODO(v17): pass $your-theme here */);

      @include mat.all-component-colors($theme);
      @include mat.button-typography($theme);
      `,
    },
  );

  defineTest(
    'should not add individual bases if all-component-themes is present',
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();
      @include mat.all-component-themes($theme);
      @include mat.tabs-density($theme);
      `,
    },
    {
      'global.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.core();
      @include mat.all-component-themes($theme);
      @include mat.tabs-density($theme);
      `,
    },
  );

  defineTest(
    'should update all instances of mat.core',
    {
      'global.scss': `
      @use '@angular/material' as mat;
      .dark-theme {
        $dark-theme: ();
        @include mat.core();
        @include mat.slider-color($dark-theme);
      }
      .light-theme {
        $light-theme: ();
        @include mat.core();
        @include mat.slider-color($light-theme);
      }
      `,
    },
    {
      'global.scss': `
      @use '@angular/material' as mat;
      .dark-theme {
        $dark-theme: ();
        @include mat.core();

        // The following mixins include base theme styles that are only needed once per application. These
        // theme styles do not depend on the color, typography, or density settings in your theme. However,
        // these styles may differ depending on the theme's design system. Currently all themes use the
        // Material 2 design system, but in the future it may be possible to create theme based on other
        // design systems, such as Material 3.
        //
        // Please note: you do not need to include the 'base' mixins, if you include the corresponding
        // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
        //
        // To learn more about "base" theme styles visit our theming guide:
        // https://material.angular.io/guide/theming#theming-dimensions
        //
        // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
        // your theme to them. This will ensure the correct values for your app are included.
        @include mat.slider-base(/* TODO(v17): pass $your-theme here */);

        @include mat.slider-color($dark-theme);
      }
      .light-theme {
        $light-theme: ();
        @include mat.core();

        // The following mixins include base theme styles that are only needed once per application. These
        // theme styles do not depend on the color, typography, or density settings in your theme. However,
        // these styles may differ depending on the theme's design system. Currently all themes use the
        // Material 2 design system, but in the future it may be possible to create theme based on other
        // design systems, such as Material 3.
        //
        // Please note: you do not need to include the 'base' mixins, if you include the corresponding
        // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
        //
        // To learn more about "base" theme styles visit our theming guide:
        // https://material.angular.io/guide/theming#theming-dimensions
        //
        // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
        // your theme to them. This will ensure the correct values for your app are included.
        @include mat.slider-base(/* TODO(v17): pass $your-theme here */);

        @include mat.slider-color($light-theme);
      }
      `,
    },
  );

  defineTest(
    'should work across multiple files',
    {
      'global.scss': `
      @use '@angular/material' as mat;
      @use './theme';
      @use './typography';
      @include mat.core();
      @include theme.app-colors();
      @include theme.app-typography();
      `,
      '_theme.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @mixin app-colors() {
        @include mat.form-field-color($theme);
      }
      `,
      '_typography.scss': `
      @use '@angular/material' as mat;
      $typography: mat.define-typography-config();
      @mixin app-typography() {
        @include mat.select-typography($typography);
      }
      `,
    },
    {
      'global.scss': `
      @use '@angular/material' as mat;
      @use './theme';
      @use './typography';
      @include mat.core();

      // The following mixins include base theme styles that are only needed once per application. These
      // theme styles do not depend on the color, typography, or density settings in your theme. However,
      // these styles may differ depending on the theme's design system. Currently all themes use the
      // Material 2 design system, but in the future it may be possible to create theme based on other
      // design systems, such as Material 3.
      //
      // Please note: you do not need to include the 'base' mixins, if you include the corresponding
      // 'theme' mixin elsewhere in your Sass. The full 'theme' mixins already include the base styles.
      //
      // To learn more about "base" theme styles visit our theming guide:
      // https://material.angular.io/guide/theming#theming-dimensions
      //
      // TODO(v17): Please move these @include statements to the preferred place in your Sass, and pass
      // your theme to them. This will ensure the correct values for your app are included.
      @include mat.form-field-base(/* TODO(v17): pass $your-theme here */);
      @include mat.select-base(/* TODO(v17): pass $your-theme here */);

      @include theme.app-colors();
      @include theme.app-typography();
      `,
      '_theme.scss': `
      @use '@angular/material' as mat;
      $theme: ();
      @mixin app-colors() {
        @include mat.form-field-color($theme);
      }
      `,
      '_typography.scss': `
      @use '@angular/material' as mat;
      $typography: mat.define-typography-config();
      @mixin app-typography() {
        @include mat.select-typography($typography);
      }
      `,
    },
  );
});
