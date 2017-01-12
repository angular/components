import { Injectable, ApplicationRef, Injector } from '@angular/core';
import {LayoutDirection} from './dir';
import {Observable} from 'rxjs/Observable';
import {ActiveLayoutDirection} from './active-layout-direction';

@Injectable()
export class GlobalDirAccessor implements ActiveLayoutDirection {
  dirChange = Observable.of([]);

  constructor(private _appRef: ApplicationRef) {}

  /**
   * Finds the root element and looks for the closest `dir` attribute value
   * @param {Injector} injector Have to be a child injector of the root component
   * @returns {Promise<string>} A resolved promise with the active direction
   */
  getActiveDirection(injector: Injector): Promise<LayoutDirection> {
    // Services are supposed to not be instantiated until a directive injects it
    // at which point componentTypes seems like it should be set
    // Doing Promise.resolve is getting around it
    return Promise.resolve(null)
      .then(() => this._getRootElement(injector))
      .then(rootComponent => this._getClosestAncestorDirValue(rootComponent));
  }

  /**
   * Looks for one of the root component and returns it's native element
   * @param {Injector} injector Have to be a child injector of the root component
   * @returns {HTMLElement} Root element
   */
  _getRootElement(injector: Injector): HTMLElement {
    for (let i = 0; i < this._appRef.componentTypes.length; i++) {
      if (injector.get(this._appRef.componentTypes[i])) {
        return this._appRef.components[i].location.nativeElement;
      }
    }
  }

  /**
   * Traverses up the dom tree from a given element and looks for the `dir` attribute value
   * @param {HTMLElement} element A DOM element to look for the closest `dir` attribute from
   * @returns {string} Closest ancestor dir value. Default is 'ltr'
   */
  _getClosestAncestorDirValue(element: HTMLElement): string {
    if (element.hasAttribute('dir')) {
      return element.getAttribute('dir');
    }

    if (element.parentElement) {
      return this._getClosestAncestorDirValue(element.parentElement);
    }

    return 'ltr';
  }
}
