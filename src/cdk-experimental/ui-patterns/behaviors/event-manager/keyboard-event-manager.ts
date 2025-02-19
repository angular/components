/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '@angular/core';
import {
  EventHandler,
  EventHandlerOptions,
  EventManager,
  hasModifiers,
  ModifierInputs,
  ModifierKey,
} from './event-manager';

/**
 * Used to represent a keycode.
 *
 * This is used to match whether an events keycode should be handled. The ability to match using a
 * string, Signal, or Regexp gives us more flexibility when authoring event handlers.
 */
type KeyCode = string | Signal<string> | RegExp;

/**
 * An event manager that is specialized for handling keyboard events. By default this manager stops
 * propagation and prevents default on all events it handles.
 */
export class KeyboardEventManager<T extends KeyboardEvent> extends EventManager<T> {
  options: EventHandlerOptions = {
    preventDefault: true,
    stopPropagation: true,
  };

  /** Configures this event manager to handle events with a specific key and no modifiers. */
  on(key: KeyCode, handler: EventHandler<T>): this;

  /**  Configures this event manager to handle events with a specific modifer and key combination. */
  on(modifiers: ModifierInputs, key: KeyCode, handler: EventHandler<T>): this;

  on(...args: any[]) {
    const {modifiers, key, handler} = this._normalizeInputs(...args);

    this.configs.push({
      handler: handler,
      matcher: event => this._isMatch(event, key, modifiers),
      ...this.options,
    });

    return this;
  }

  private _normalizeInputs(...args: any[]) {
    const key = args.length === 3 ? args[1] : args[0];
    const handler = args.length === 3 ? args[2] : args[1];
    const modifiers = args.length === 3 ? args[0] : ModifierKey.None;

    return {
      key: key as KeyCode,
      handler: handler as EventHandler<T>,
      modifiers: modifiers as ModifierInputs,
    };
  }

  private _isMatch(event: T, key: KeyCode, modifiers: ModifierInputs) {
    if (key instanceof RegExp) {
      return key.test(event.key);
    }

    const keyStr = typeof key === 'string' ? key : key();
    return keyStr.toLowerCase() === event.key.toLowerCase() && hasModifiers(event, modifiers);
  }
}
