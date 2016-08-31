/**
 * Provide an API for animating elements with CSS transitions
 */
export class Animate {

  /**
   * Look up the transition event name for the browser type and cache it.
   */
  static TRANSITION_EVENT: string = Animate.whichTransitionEvent();

  static enter(el: HTMLElement, cssClass: string): Promise<void> {
    el.classList.remove(cssClass);
    return new Promise<void>((resolve: any) => {
      el.classList.add(cssClass + '-add');
      setTimeout(() => {
        let duration = Animate.getTransitionDuration(el, true);
        let removeListener = () => done(false);
        let callTimeout = setTimeout(() => done(true), duration);
        let done = (timeout: any) => {
          if (!removeListener) {
            return;
          }
          el.classList.remove(cssClass + '-add-active');
          el.classList.remove(cssClass + '-add');
          if (!timeout) {
            clearTimeout(callTimeout);
          }
          el.removeEventListener(Animate.TRANSITION_EVENT, removeListener);
          removeListener = null;
          resolve();
        };
        el.addEventListener(Animate.TRANSITION_EVENT, removeListener);
        el.classList.add(cssClass + '-add-active');
        el.classList.add(cssClass);
      }, 1);
    });
  }

  static leave(el: HTMLElement, cssClass: string): Promise<void> {
    return new Promise<void>((resolve: any) => {
      el.classList.add(cssClass + '-remove');
      setTimeout(() => {
        let duration = Animate.getTransitionDuration(el, true);
        let callTimeout = setTimeout(() => done(true), duration);
        let removeListener = () => done(false);

        let done = (timeout: any) => {
          if (!removeListener) {
            return;
          }
          el.classList.remove(cssClass + '-remove-active');
          el.classList.remove(cssClass + '-remove');
          if (!timeout) {
            clearTimeout(callTimeout);
          }
          el.removeEventListener(Animate.TRANSITION_EVENT, removeListener);
          removeListener = null;
          resolve();
        };
        el.addEventListener(Animate.TRANSITION_EVENT, removeListener);
        el.classList.add(cssClass + '-remove-active');
        el.classList.remove(cssClass);
      }, 1);
    });
  }

  /**
   * Get the duration of any transitions being applied to the given element.
   *
   * Based on: https://gist.github.com/snorpey/5323028
   * @param element The element to query
   * @param includeDelay Include any specified transition-delay value.
   * @returns {number}
   */
  static getTransitionDuration(element: HTMLElement, includeDelay: boolean = false) {
    let prefixes = ['', 'moz', 'webkit', 'ms', 'o', 'khtml'];
    let style: any = window.getComputedStyle(element);
    for (let i = 0; i < prefixes.length; i++) {
      let durationProperty = (i === 0 ? '' : `-${prefixes[i]}-`) + `transition-duration`;
      let duration = style[durationProperty];
      if (!duration) {
        continue;
      }
      duration = (duration.indexOf('ms') > -1) ? parseFloat(duration) : parseFloat(duration) * 1000;
      if (duration === 0) {
        continue;
      }
      if (includeDelay) {
        let delayProperty = (i === 0 ? '' : `-${prefixes[i]}-`) + `transition-delay`;
        let delay = style[delayProperty];
        if (typeof delay !== 'undefined') {
          duration += (delay.indexOf('ms') > -1) ? parseFloat(delay) : parseFloat(delay) * 1000;
        }
      }
      return duration;
    }
    return -1;
  }

  static setTransitionDuration(element: any, delayMs: number) {
    element.style['transition-duration'] = `${delayMs}ms`;
  }

  /* From Modernizr */
  static whichTransitionEvent(): string {
    if (typeof document === 'undefined') {
      return 'transitionend';
    }
    let t: string;
    let el: any = document.createElement('fakeelement');
    let transitions: { [prefix: string]: string } = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }

  /**
   * Set CSS styles immediately by turning off transition duration and restoring it afterward
   */
  static setStyles(element: any, styles: { [style: string]: string | number }): Promise<void> {
    let saveDuration = Animate.getTransitionDuration(element, false);
    Animate.setTransitionDuration(element, 0);
    return new Promise<void>((resolve: any, reject: any) => {
      Object.keys(styles).forEach((key: string) => {
        element.style[key] = `${styles[key]}`;
      });
      if (saveDuration !== -1) {
        Animate.setTransitionDuration(element, saveDuration);
      } else {
        element.style['transition-duration'] = null;
      }
      resolve();
    });
  }


  /**
   * Wait a period of time, then resolve a promise.
   * @param milliseconds The period to wait before resolving.
   * @returns {Promise<void>|Promise} A promise that resolves after a period of time.
   */
  static wait(milliseconds: number = 10): Promise<void> {
    return new Promise<void>((resolve: any) => {
      setTimeout(() => resolve(), milliseconds);
    });
  }
}
