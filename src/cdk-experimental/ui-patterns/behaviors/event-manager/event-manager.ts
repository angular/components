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

/** A basic event handler. */
export type EventHandler<T extends Event> = (event: T) => void;

/** A function that determines whether an event is to be handled. */
export type EventMatcher<T extends Event> = (event: T) => boolean;

/** A config that specifies how to handle a particular event. */
export interface EventHandlerConfig<T extends Event> extends EventHandlerOptions {
  matcher: EventMatcher<T>;
  handler: EventHandler<T>;
}

/** Bit flag representation of the possible modifier keys that can be present on an event. */
export enum ModifierKey {
  None = 0,
  Ctrl = 0b1,
  Shift = 0b10,
  Alt = 0b100,
  Meta = 0b1000,
  Any = 'Any',
}

export type ModifierInputs = ModifierKey | ModifierKey[];

/**
 * Abstract base class for all event managers.
 *
 * Event managers are designed to normalize how event handlers are authored and create a safety net
 * for common event handling gotchas like remembering to call preventDefault or stopPropagation.
 */
export abstract class EventManager<T extends Event> {
  protected configs: EventHandlerConfig<T>[] = [];
  abstract options: EventHandlerOptions;

  /** Runs the handlers that match with the given event. */
  handle(event: T): void {
    for (const config of this.configs) {
      if (config.matcher(event)) {
        config.handler(event);

        if (config.preventDefault) {
          event.preventDefault();
        }

        if (config.stopPropagation) {
          event.stopPropagation();
        }
      }
    }
  }

  /** Configures the event manager to handle specific events. (See subclasses for more). */
  abstract on(...args: [...unknown[]]): this;
}

/** Gets bit flag representation of the modifier keys present on the given event. */
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
export function hasModifiers(event: EventWithModifiers, modifiers: ModifierInputs): boolean {
  const eventModifiers = getModifiers(event);
  const modifiersList = Array.isArray(modifiers) ? modifiers : [modifiers];

  if (modifiersList.includes(ModifierKey.Any)) {
    return true;
  }

  return modifiersList.some(modifiers => eventModifiers === modifiers);
}
