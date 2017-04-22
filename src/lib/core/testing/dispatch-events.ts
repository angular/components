import {
  createFakeEvent,
  createKeyboardEvent,
  createMouseEvent
} from './event-objects';

/** Shorthand to dispatch a fake event on a specified node. */
export function dispatchFakeEvent(node: Node | Window, type: string) {
  let event = createFakeEvent(type);
  node.dispatchEvent(event);
  return event;
}

/** Shorthand to dispatch a keyboard event with a specified key code. */
export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number) {
  let event = createKeyboardEvent(type, keyCode);
  node.dispatchEvent(event);
  return event;
}

/** Shorthand to dispatch a mouse event on the specified coordinates. */
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0) {
  let event = createMouseEvent(type, x, y);
  node.dispatchEvent(event);
  return event;
}
