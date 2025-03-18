/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {booleanAttribute} from '@angular/core';
import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {ButtonAppearance, ButtonHarnessFilters, ButtonVariant} from './button-harness-filters';

/** Harness for interacting with a mat-button in tests. */
export class MatButtonHarness extends ContentContainerComponentHarness {
  // TODO(jelbourn) use a single class, like `.mat-button-base`
  static hostSelector = `[matButton], [mat-button], [matIconButton], [matFab], [matMiniFab],
    [mat-raised-button], [mat-flat-button], [mat-icon-button], [mat-stroked-button], [mat-fab],
    [mat-mini-fab]`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a button whose host element matches the given selector.
   *   - `text` finds a button with specific text content.
   *   - `variant` finds buttons matching a specific variant.
   *   - `appearance` finds buttons matching a specific appearance.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatButtonHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ButtonHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption('variant', options.variant, (harness, variant) =>
        HarnessPredicate.stringMatches(harness.getVariant(), variant),
      )
      .addOption('appearance', options.appearance, (harness, appearance) =>
        HarnessPredicate.stringMatches(harness.getAppearance(), appearance),
      )
      .addOption('disabled', options.disabled, async (harness, disabled) => {
        return (await harness.isDisabled()) === disabled;
      });
  }

  /**
   * Clicks the button at the given position relative to its top-left.
   * @param relativeX The relative x position of the click.
   * @param relativeY The relative y position of the click.
   */
  click(relativeX: number, relativeY: number): Promise<void>;
  /** Clicks the button at its center. */
  click(location: 'center'): Promise<void>;
  /** Clicks the button. */
  click(): Promise<void>;
  async click(...args: [] | ['center'] | [number, number]): Promise<void> {
    return (await this.host()).click(...(args as []));
  }

  /** Gets a boolean promise indicating if the button is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (
      booleanAttribute(await host.getAttribute('disabled')) ||
      (await host.hasClass('mat-mdc-button-disabled'))
    );
  }

  /** Gets a promise for the button's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the button and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the button and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the button is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Gets the variant of the button. */
  async getVariant(): Promise<ButtonVariant> {
    const host = await this.host();

    // TODO(crisbeto): we're checking both classes and attributes for backwards compatibility
    // with some internal apps that were applying the attribute without importing the directive.
    // Really we should be only targeting the classes.
    if (
      (await host.hasClass('mat-mdc-icon-button')) ||
      (await host.getAttribute('mat-icon-button')) != null
    ) {
      return 'icon';
    }

    if (
      (await host.hasClass('mat-mdc-mini-fab')) ||
      (await host.getAttribute('mat-mini-fab')) != null
    ) {
      return 'mini-fab';
    }

    if ((await host.hasClass('mat-mdc-fab')) || (await host.getAttribute('mat-fab')) != null) {
      return 'fab';
    }

    return 'basic';
  }

  /** Gets the appearance of the button. */
  async getAppearance(): Promise<ButtonAppearance | null> {
    const host = await this.host();

    if (await host.hasClass('mat-mdc-outlined-button')) {
      return 'outlined';
    }

    if (await host.hasClass('mat-mdc-raised-button')) {
      return 'elevated';
    }

    if (await host.hasClass('mat-mdc-unelevated-button')) {
      return 'filled';
    }

    if (await host.hasClass('mat-mdc-button')) {
      return 'text';
    }

    if (await host.hasClass('mat-tonal-button')) {
      return 'tonal';
    }

    return null;
  }
}
