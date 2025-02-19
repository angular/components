/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EventHandler,
  EventHandlerConfig,
  EventHandlerOptions,
  EventManager,
  hasModifiers,
  ModifierInputs,
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
export class MouseEventManager<T extends MouseEvent> extends EventManager<T> {
  options: EventHandlerOptions = {
    preventDefault: false,
    stopPropagation: false,
  };

  /**
   * Configures this event manager to handle events with a specific modifer and mouse button
   * combination.
   */
  on(button: MouseButton, modifiers: ModifierInputs, handler: EventHandler<T>): this;

  /**
   * Configures this event manager to handle events with a specific mouse button and no modifiers.
   */
  on(modifiers: ModifierInputs, handler: EventHandler<T>): this;

  /**
   * Configures this event manager to handle events with the main mouse button and no modifiers.
   *
   * @param handler The handler function
   * @param options Options for whether to stop propagation or prevent default.
   */
  on(handler: EventHandler<T>): this;

  on(...args: any[]) {
    const {button, handler, modifiers} = this._normalizeInputs(...args);

    this.configs.push({
      handler,
      matcher: event => this._isMatch(event, button, modifiers),
      ...this.options,
    });
    return this;
  }

  private _normalizeInputs(...args: any[]) {
    if (args.length === 3) {
      return {
        button: args[0] as MouseButton,
        modifiers: args[1] as ModifierInputs,
        handler: args[2] as EventHandler<T>,
      };
    }

    if (typeof args[0] === 'number' && typeof args[1] === 'function') {
      return {
        button: MouseButton.Main,
        modifiers: args[0] as ModifierInputs,
        handler: args[1] as EventHandler<T>,
      };
    }

    return {
      button: MouseButton.Main,
      modifiers: ModifierKey.None,
      handler: args[0] as EventHandler<T>,
    };
  }

  _isMatch(event: MouseEvent, button: MouseButton, modifiers: ModifierInputs) {
    return button === (event.button ?? 0) && hasModifiers(event, modifiers);
  }
}
