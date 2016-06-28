import {Injectable} from '@angular/core';
import {MdGestureConfig} from '@angular2-material/core/gestures/MdGestureConfig';

/**
 * To test the dragging behavior on the slider, we need to be able to access the hammer instances
 * to emit events for a drag.
 */
@Injectable()
export class TestGestureConfig extends MdGestureConfig {
  /**
   * A map of Hammer instances to element.
   * Used to emit events over instances for an element.
   */
  hammerInstances: Map<HTMLElement, HammerManager[]> = new Map<HTMLElement, HammerManager[]>();

  /**
   * Create a mapping of Hammer instances to element so that events can be emitted during testing.
   */
  buildHammer(element: HTMLElement) {
    let mc = super.buildHammer(element);

    if (!this.hammerInstances.get(element)) {
      this.hammerInstances.set(element, [mc]);
    } else {
      this.hammerInstances.get(element).push(mc);
    }

    return mc;
  }

  /**
   * Hammer creates a new instance for every listener so we need to apply our event on all instances
   * to hit the correct listener.
   */
  emitEventForElement(eventType: string, element: HTMLElement, eventData: Object) {
    let instances = this.hammerInstances.get(element);
    instances.forEach(instance => instance.emit(eventType, eventData));
  }
}
