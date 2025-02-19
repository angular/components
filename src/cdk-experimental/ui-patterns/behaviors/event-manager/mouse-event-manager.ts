/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EventHandlerConfig,
  EventHandlerOptions,
  EventManager,
  hasModifiers,
  ModifierKey,
} from './event-manager';

/**
 * The different mouse buttons that may appear on a mouse event.
 */
export enum MouseButton {
  Main = 0,
  Auxiliary = 1,
  Secondary = 2,
}

/**
 * A config that specifies how to handle a particular mouse event.
 */
export interface MouseEventHandlerConfig extends EventHandlerConfig<MouseEvent> {
  button: number;
  modifiers: number | number[];
}

/**
 * An event manager that is specialized for handling mouse events. By default this manager stops
 * propagation and prevents default on all events it handles.
 */
export class MouseEventManager extends EventManager<MouseEvent> {
  override configs: MouseEventHandlerConfig[] = [];

  protected override defaultHandlerOptions: EventHandlerOptions = {
    preventDefault: true,
    stopPropagation: true,
  };

  /**
   * Configures this event manager to handle events with a specific modifer and mouse button
   * combination.
   *
   * @param button The mouse button that this handler should run for.
   * @param modifiers The modifier combinations that this handler should run for.
   * @param handler The handler function
   * @param options Options for whether to stop propagation or prevent default.
   */
  on(
    button: MouseButton,
    modifiers: number | number[],
    handler: ((event: MouseEvent) => void) | ((event: MouseEvent) => boolean),
    options?: EventHandlerOptions,
  ): this;

  /**
   * Configures this event manager to handle events with a specific mouse button and no modifiers.
   *
   * @param modifiers The modifier combinations that this handler should run for.
   * @param handler The handler function
   * @param options Options for whether to stop propagation or prevent default.
   */
  on(
    modifiers: number | number[],
    handler: ((event: MouseEvent) => void) | ((event: MouseEvent) => boolean),
    options?: EventHandlerOptions,
  ): this;

  /**
   * Configures this event manager to handle events with the main mouse button and no modifiers.
   *
   * @param handler The handler function
   * @param options Options for whether to stop propagation or prevent default.
   */
  on(
    handler: ((event: MouseEvent) => void) | ((event: MouseEvent) => boolean),
    options?: EventHandlerOptions,
  ): this;

  on(...args: any[]) {
    const {button, handler, modifiers, options} = this.normalizeHandlerOptions(...args);

    // TODO: Add strict type checks again when finalizing this API.

    this.configs.push({
      button,
      handler,
      modifiers,
      ...this.defaultHandlerOptions,
      ...options,
    });
    return this;
  }

  normalizeHandlerOptions(...args: any[]) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
      return {
        button: args[0],
        modifiers: args[1],
        handler: args[2],
        options: args[3] || {},
      };
    }

    if (typeof args[0] === 'number' && typeof args[1] === 'function') {
      return {
        button: MouseButton.Main,
        modifiers: args[0],
        handler: args[1],
        options: args[2] || {},
      };
    }

    return {
      button: MouseButton.Main,
      modifiers: ModifierKey.None,
      handler: args[0],
      options: args[1] || {},
    };
  }

  getHandlersForKey(event: MouseEvent) {
    const configs: MouseEventHandlerConfig[] = [];
    for (const config of this.configs) {
      if (config.button === (event.button ?? 0) && hasModifiers(event, config.modifiers)) {
        configs.push(config);
      }
    }
    return configs;
  }
}
