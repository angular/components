// tslint:disable max-line-length

/**
 * This file contains exports that are used by other packages of Material. Exports are re-exported
 * with another name. In angular/angular those exports will be prefixed with Ɵ.
 */

// TODO(paul): currently we use a normal underscore instead of Ɵ. (Due to TSLint)

export {ActiveDescendantKeyManager as _ActiveDescendantKeyManager} from './a11y/activedescendant-key-manager';
export {CanDisable as _CanDisable, mixinDisabled as _mixinDisabled} from './common-behaviors/index';
export {Focusable as _Focusable, FocusKeyManager as _FocusKeyManager} from './a11y/focus-key-manager';
export {extendObject as _extendObject} from './util/object-extend';
export {VIEWPORT_RULER_PROVIDER as _VIEWPORT_RULER_PROVIDER, ViewportRuler as _ViewportRuler} from './overlay/position/viewport-ruler';
export {LIVE_ANNOUNCER_PROVIDER as _LIVE_ANNOUNCER_PROVIDER} from './a11y/live-announcer';
export {SCROLL_DISPATCHER_PROVIDER as _SCROLL_DISPATCHER_PROVIDER} from './overlay/scroll/scroll-dispatcher';
