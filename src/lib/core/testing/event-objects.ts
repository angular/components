/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(type: string, x = 0, y = 0) {
  let event = document.createEvent('MouseEvent');

  event.initMouseEvent(type,
    false, /* canBubble */
    false, /* cancelable */
    window, /* view */
    0, /* detail */
    x, /* screenX */
    y, /* screenY */
    x, /* clientX */
    y, /* clientY */
    false, /* ctrlKey */
    false, /* altKey */
    false, /* shiftKey */
    false, /* metaKey */
    0, /* button */
    null /* relatedTarget */);

  return event;
}

/** Dispatches a keydown event from an element. */
export function createKeyboardEvent(eventType: string, keyCode: number) {
  let event = document.createEvent('KeyboardEvent') as any;
  // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
  let initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);

  initEventFn(eventType, true, true, window, 0, 0, 0, 0, 0, keyCode);

  // Webkit Browsers don't set the keyCode when calling the init function.
  // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
  Object.defineProperty(event, 'keyCode', {
    get: function() { return keyCode; }
  });

  return event;
}

/** Creates a transition event with the specified property name. */
export function createTransitionEndEvent(propertyName: string, elapsedTime = 0) {
  // Some browsers have the TransitionEvent class, but once the class is being instantiated
  // the browser will throw an exception. Those browsers don't support the constructor yet.
  // To ensure that those browsers also work, the TransitionEvent is created by using the
  // deprecated `initTransitionEvent` function.
  try {
    // TypeScript does not have valid types for the TransitionEvent class, so use `any`.
    return new (TransitionEvent as any)('transitionend', {propertyName, elapsedTime});
  } catch (e) {
    let event = document.createEvent('TransitionEvent');
    event.initTransitionEvent('transitionend', false, false, propertyName, elapsedTime);
    return event;
  }
}

/** Creates a fake event object with any desired event type. */
export function createFakeEvent(eventName: string) {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  return event;
}
