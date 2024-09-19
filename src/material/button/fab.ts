/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from '@angular/core';

import {MatAnchor} from './button';
import {MAT_ANCHOR_HOST, MAT_BUTTON_HOST, MatButtonBase} from './button-base';
import {ThemePalette} from '@angular/material/core';

/** Default FAB options that can be overridden. */
export interface MatFabDefaultOptions {
  /**
   * Default theme color of the button. This API is supported in M2 themes
   * only, it has no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants
   */
  color?: ThemePalette;
}

/** Injection token to be used to override the default options for FAB. */
export const MAT_FAB_DEFAULT_OPTIONS = new InjectionToken<MatFabDefaultOptions>(
  'mat-mdc-fab-default-options',
  {
    providedIn: 'root',
    factory: MAT_FAB_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_FAB_DEFAULT_OPTIONS_FACTORY(): MatFabDefaultOptions {
  return {
    // The FAB by default has its color set to accent.
    color: 'accent',
  };
}

// Default FAB configuration.
const defaults = MAT_FAB_DEFAULT_OPTIONS_FACTORY();

/**
 * Material Design floating action button (FAB) component. These buttons represent the primary
 * or most common action for users to interact with.
 * See https://material.io/components/buttons-floating-action-button/
 *
 * The `MatFabButton` class has two appearances: normal and extended.
 */
@Component({
  selector: `button[mat-fab]`,
  templateUrl: 'button.html',
  styleUrl: 'fab.css',
  host: {
    ...MAT_BUTTON_HOST,
    '[class.mdc-fab--extended]': 'extended',
    '[class.mat-mdc-extended-fab]': 'extended',
  },
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MatFabButton extends MatButtonBase {
  private _options = inject<MatFabDefaultOptions>(MAT_FAB_DEFAULT_OPTIONS, {optional: true});

  override _isFab = true;

  @Input({transform: booleanAttribute}) extended: boolean;

  constructor(...args: unknown[]);

  constructor() {
    super();
    this._options = this._options || defaults;
    this.color = this._options!.color || defaults.color;
  }
}

/**
 * Material Design mini floating action button (FAB) component. These buttons represent the primary
 * or most common action for users to interact with.
 * See https://material.io/components/buttons-floating-action-button/
 */
@Component({
  selector: `button[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrl: 'fab.css',
  host: MAT_BUTTON_HOST,
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MatMiniFabButton extends MatButtonBase {
  private _options = inject<MatFabDefaultOptions>(MAT_FAB_DEFAULT_OPTIONS, {optional: true});

  override _isFab = true;

  constructor(...args: unknown[]);

  constructor() {
    super();
    this._options = this._options || defaults;
    this.color = this._options!.color || defaults.color;
  }
}

/**
 * Material Design floating action button (FAB) component for anchor elements. Anchor elements
 * are used to provide links for the user to navigate across different routes or pages.
 * See https://material.io/components/buttons-floating-action-button/
 *
 * The `MatFabAnchor` class has two appearances: normal and extended.
 */
@Component({
  selector: `a[mat-fab]`,
  templateUrl: 'button.html',
  styleUrl: 'fab.css',
  host: {
    ...MAT_ANCHOR_HOST,
    '[class.mdc-fab--extended]': 'extended',
    '[class.mat-mdc-extended-fab]': 'extended',
  },
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MatFabAnchor extends MatAnchor {
  private _options = inject<MatFabDefaultOptions>(MAT_FAB_DEFAULT_OPTIONS, {optional: true});

  override _isFab = true;

  @Input({transform: booleanAttribute}) extended: boolean;

  constructor(...args: unknown[]);

  constructor() {
    super();
    this._options = this._options || defaults;
    this.color = this._options!.color || defaults.color;
  }
}

/**
 * Material Design mini floating action button (FAB) component for anchor elements. Anchor elements
 * are used to provide links for the user to navigate across different routes or pages.
 * See https://material.io/components/buttons-floating-action-button/
 */
@Component({
  selector: `a[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrl: 'fab.css',
  host: MAT_ANCHOR_HOST,
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MatMiniFabAnchor extends MatAnchor {
  private _options = inject<MatFabDefaultOptions>(MAT_FAB_DEFAULT_OPTIONS, {optional: true});

  override _isFab = true;

  constructor(...args: unknown[]);

  constructor() {
    super();
    this._options = this._options || defaults;
    this.color = this._options!.color || defaults.color;
  }
}
