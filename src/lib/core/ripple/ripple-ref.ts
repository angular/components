import {RippleConfig, RippleRenderer} from './ripple-renderer';

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {

  constructor(
    private renderer: RippleRenderer,
    public element: HTMLElement,
    public config: RippleConfig) {
  }

  /** Fades out the ripple element. */
  fadeOut() {
    let rippleIndex = this.renderer.activeRipples.indexOf(this);

    // Remove the ripple reference if added to the list of active ripples.
    if (rippleIndex !== -1) {
      this.renderer.activeRipples.splice(rippleIndex, 1);
    }

    // Regardless of being added to the list, fade-out the ripple element.
    this.renderer.fadeOutRipple(this.element);
  }
}
