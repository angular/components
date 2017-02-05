import {
  createFakeEvent,
  createKeyboardEvent,
  createMouseEvent,
  createTransitionEndEvent
} from './event-objects';

/** Shorthand to dispatch a fake event on a specified node. */
export function dispatchFakeEvent(node: Node, eventName: string) {
  node.dispatchEvent(createFakeEvent(eventName));
}

/** Shorthand to dispatch a keyboard event with a specified key code. */
export function dispatchKeyboardEvent(node: Node, keyCode: number, type = 'keydown') {
  node.dispatchEvent(createKeyboardEvent(type, keyCode));
}

/** Shorthand to dispatch a mouse event on the specified coordinates. */
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0) {
  node.dispatchEvent(createMouseEvent(type, x, y));
}

/** Shorthand to dispatch a transition event with a specified property. */
export function dispatchTransitionEndEvent(node: Node, propertyName: string, elapsedTime = 0) {
  node.dispatchEvent(createTransitionEndEvent(propertyName, elapsedTime));
}
