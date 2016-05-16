import {Injectable} from '@angular/core';


/**
 * Class for toggles to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item
 * currently being selected, and we still need to uncheck the previous selection.
 */
@Injectable()
export class MdToggleDispatcher {
  private _listeners: Function[];

  constructor() {
    this._listeners = [];
  }

  /** Notify other toggles that selection for the given name has been set. */
  notify(name: string) {
    this._listeners.forEach(listener => listener(name));
  }

  /** Listen for future changes to toggle selection. */
  listen(listener: (name: string) => void) {
    this._listeners.push(listener);
  }
}
