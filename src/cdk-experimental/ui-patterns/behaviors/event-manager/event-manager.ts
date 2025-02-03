/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * An event that supports modifier keys.
 *
 * Matches the native KeyboardEvent, MouseEvent, and TouchEvent.
 */
export interface EventWithModifiers extends Event {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

/**
 * Options that are applicable to all event handlers.
 *
 * This library has not yet had a need for stopPropagationImmediate.
 */
export interface EventHandlerOptions {
  stopPropagation: boolean;
  preventDefault: boolean;
}

/**
 * A config that specifies how to handle a particular event.
 */
export interface EventHandlerConfig<T extends Event> extends EventHandlerOptions {
  handler: (event: T) => Promise<boolean | void>;
}

/**
 * Bit flag representation of the possible modifier keys that can be present on an event.
 */
export enum ModifierKey {
  None = 0,
  Ctrl = 0b1,
  Shift = 0b10,
  Alt = 0b100,
  Meta = 0b1000,
}

/**
 * Abstract base class for all event managers.
 *
 * Event managers are designed to normalize how event handlers are authored and create a safety net
 * for common event handling gotchas like remembering to call preventDefault or stopPropagation.
 */
export abstract class EventManager<T extends Event> {
  private _submanagers: EventManager<T>[] = [];

  protected configs: EventHandlerConfig<T>[] = [];
  protected beforeFns: ((event: T) => void)[] = [];
  protected afterFns: ((event: T) => void)[] = [];

  protected defaultHandlerOptions: EventHandlerOptions = {
    preventDefault: false,
    stopPropagation: false,
  };

  constructor(defaultHandlerOptions?: Partial<EventHandlerOptions>) {
    this.defaultHandlerOptions = {
      ...this.defaultHandlerOptions,
      ...defaultHandlerOptions,
    };
  }

  /**
   * Composes together multiple event managers into a single event manager that delegates to the
   * individual managers.
   */
  static compose<T extends Event>(...managers: EventManager<T>[]) {
    const composedManager = new GenericEventManager<T>();
    composedManager._submanagers = managers;
    return composedManager;
  }

  /**
   * Runs any handlers that have been configured to handle this event. If multiple handlers are
   * configured for this event, they are run in the order they were configured. Returns
   * `true` if the event has been handled, otherwise returns `undefined`.
   *
   * Note: the use of `undefined` instead of `false` in the unhandled case is necessary to avoid
   * accidentally preventing the default behavior on an unhandled event.
   */
  async handle(event: T): Promise<true | undefined> {
    if (!this.isHandled(event)) {
      return undefined;
    }
    for (const fn of this.beforeFns) {
      fn(event);
    }
    for (const submanager of this._submanagers) {
      await submanager.handle(event);
    }
    for (const config of this.getHandlersForKey(event)) {
      await config.handler(event);
      if (config.stopPropagation) {
        event.stopPropagation();
      }
      if (config.preventDefault) {
        event.preventDefault();
      }
    }
    for (const fn of this.afterFns) {
      fn(event);
    }
    return true;
  }

  /**
   * Configures the event manager to run a function immediately before it as about to handle
   * any event.
   */
  beforeHandling(fn: (event: T) => void): this {
    this.beforeFns.push(fn);
    return this;
  }

  /**
   * Configures the event manager to run a function immediately after it handles any event.
   */
  afterHandling(fn: (event: T) => void): this {
    this.afterFns.push(fn);
    return this;
  }

  /**
   * Configures the event manager to handle specific events. (See subclasses for more).
   */
  abstract on(...args: [...unknown[]]): this;

  /**
   * Gets all of the handler configs that are applicable to the given event.
   */
  protected abstract getHandlersForKey(event: T): EventHandlerConfig<T>[];

  /**
   * Checks whether this event manager is confugred to handle the given event.
   */
  protected isHandled(event: T): boolean {
    return (
      this.getHandlersForKey(event).length > 0 || this._submanagers.some(sm => sm.isHandled(event))
    );
  }
}

/**
 * A generic event manager that can work with any type of event.
 */
export class GenericEventManager<T extends Event> extends EventManager<T> {
  /**
   * Configures this event manager to handle all events with the given handler.
   */
  on(handler: (event: T) => Promise<boolean | void>): this {
    this.configs.push({
      ...this.defaultHandlerOptions,
      handler,
    });
    return this;
  }

  getHandlersForKey(_event: T): EventHandlerConfig<T>[] {
    return this.configs;
  }
}

/**
 * Gets bit flag representation of the modifier keys present on the given event.
 */
export function getModifiers(event: EventWithModifiers): number {
  return (
    (+event.ctrlKey && ModifierKey.Ctrl) |
    (+event.shiftKey && ModifierKey.Shift) |
    (+event.altKey && ModifierKey.Alt) |
    (+event.metaKey && ModifierKey.Meta)
  );
}

/**
 * Checks if the given event has modifiers that are an exact match for any of the given modifier
 * flag combinations.
 */
export function hasModifiers(event: EventWithModifiers, modifiers: number | number[]): boolean {
  const eventModifiers = getModifiers(event);
  const modifiersList = Array.isArray(modifiers) ? modifiers : [modifiers];
  return modifiersList.some(modifiers => eventModifiers === modifiers);
}
