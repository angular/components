/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Cached result of whether the user's browser supports passive event listeners. */
let supportsPassiveEvents: boolean;
let rtlScrollAxisType: 'normal' | 'negated' | 'inverted';

/**
 * Checks whether the user's browser supports passive event listeners.
 * See: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
export function supportsPassiveEventListeners(): boolean {
  if (supportsPassiveEvents == null && typeof window !== 'undefined') {
    try {
      window.addEventListener('test', null!, Object.defineProperty({}, 'passive', {
        get: () => supportsPassiveEvents = true
      }));
    } finally {
      supportsPassiveEvents = supportsPassiveEvents || false;
    }
  }

  return supportsPassiveEvents;
}

/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior(): boolean {
  return !!(document && document.documentElement && document.documentElement.style &&
      'scrollBehavior' in document.documentElement.style);
}

/** Cached result Set of input types support by the current browser. */
let supportedInputTypes: Set<string>;

/** Types of `<input>` that *might* be supported. */
const candidateInputTypes = [
  // `color` must come first. Chrome 56 shows a warning if we change the type to `color` after
  // first changing it to something else:
  // The specified value "" does not conform to the required format.
  // The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.
  'color',
  'button',
  'checkbox',
  'date',
  'datetime-local',
  'email',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
  'tel',
  'text',
  'time',
  'url',
  'week',
];

/** @returns The input types supported by this browser. */
export function getSupportedInputTypes(): Set<string> {
  // Result is cached.
  if (supportedInputTypes) {
    return supportedInputTypes;
  }

  // We can't check if an input type is not supported until we're on the browser, so say that
  // everything is supported when not on the browser. We don't use `Platform` here since it's
  // just a helper function and can't inject it.
  if (typeof document !== 'object' || !document) {
    supportedInputTypes = new Set(candidateInputTypes);
    return supportedInputTypes;
  }

  let featureTestInput = document.createElement('input');
  supportedInputTypes = new Set(candidateInputTypes.filter(value => {
    featureTestInput.setAttribute('type', value);
    return featureTestInput.type === value;
  }));

  return supportedInputTypes;
}

/**
 * Checks the type of RTL scroll axis used by this browser. The possible values are
 * - normal: scrollLeft is 0 when scrolled all the way left and (scrollWidth - clientWidth) when
 *     scrolled all the way right.
 * - negated: scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and 0 when
 *     scrolled all the way right.
 * - inverted: scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and 0 when
 *     scrolled all the way right.
 */
export function getRtlScrollAxisType(): 'normal' | 'negated' | 'inverted' {
  // We can't check unless we're on the browser. Just assume 'normal' if we're not.
  if (typeof document !== 'object' || !document) {
    return 'normal';
  }

  if (!rtlScrollAxisType) {
    const viewport = document.createElement('div');
    viewport.dir = 'rtl';
    viewport.style.height = '1px';
    viewport.style.width = '1px';
    viewport.style.overflow = 'auto';
    viewport.style.visibility = 'hidden';
    viewport.style.pointerEvents = 'none';
    viewport.style.position = 'absolute';

    const content = document.createElement('div');
    content.style.width = '2px';
    content.style.height = '1px';

    viewport.appendChild(content);
    document.body.appendChild(viewport);

    rtlScrollAxisType = 'normal';
    if (viewport.scrollLeft == 0) {
      viewport.scrollLeft = 1;
      rtlScrollAxisType = viewport.scrollLeft == 0 ? 'negated' : 'inverted';
    }
    document.body.removeChild(viewport);
  }
  return rtlScrollAxisType;
}
