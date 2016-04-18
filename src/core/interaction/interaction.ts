import {Injectable} from 'angular2/core';

export enum MdInteractionType {
  KEYBOARD,
  MOUSE,
  TOUCH
}

// Interface for the interaction mappings, which holds an index definition
// to avoid implicitly warnings.
interface MdInteractionMap {
  [index: string]: any;
}

@Injectable()
export class MdInteraction {

  private _isBuffering: boolean = false;
  private _bufferTimeout: number;
  private _lastInteractionType: MdInteractionType;

  private _inputTypeMap: MdInteractionMap = {
    'keydown': MdInteractionType.KEYBOARD,
    'mousedown': MdInteractionType.MOUSE,
    'mouseenter': MdInteractionType.MOUSE,
    'touchstart': MdInteractionType.TOUCH,
    'pointerdown': 'pointer',
    'MSPointerDown': 'pointer',
};

  // IE dispatches `pointerdown` events, which need to be validated separately.
  // Index numbers referenced here: https://msdn.microsoft.com/library/windows/apps/hh466130.aspx
  private _iePointerMap: MdInteractionMap = {
    2: MdInteractionType.TOUCH,
    3: MdInteractionType.TOUCH,
    4: MdInteractionType.MOUSE
  };

  constructor() {
    let mouseEvent = 'PointerEvent' in window ? 'pointerdown' : 'mousedown';

    document.body.addEventListener('keydown', (e: Event) => this._onInputEvent(e));
    document.body.addEventListener(mouseEvent, (e: Event) => this._onInputEvent(e));
    document.body.addEventListener('mouseenter', (e: Event) => this._onInputEvent(e));

    if ('ontouchstart' in document.documentElement) {
      document.body.addEventListener('touchstart', (e: TouchEvent) => this._onTouchInputEvent(e));
    }
  }

  private _onInputEvent(event: Event) {
    if (this._isBuffering) {
      return;
    }

    let type = this._inputTypeMap[event.type];

    if (type === 'pointer') {
      let pointerType = (<any> event)['pointerType'];
      type = (typeof pointerType === 'number') ? this._iePointerMap[pointerType]
        : this._parsePointerType(pointerType);
    }

    if (type !== undefined) {
      this._lastInteractionType = type;
    }
  }

  private _onTouchInputEvent(event: TouchEvent) {
    clearTimeout(this._bufferTimeout);

    this._onInputEvent(event);
    this._isBuffering = true;

    // The timeout of 650ms is needed to delay the touchstart, because otherwise the touch will call
    // the `onInput` function multiple times.
    this._bufferTimeout = setTimeout(() => this._isBuffering = false, 650);
  }

  private _parsePointerType(pointerType: string) {
    switch (pointerType) {
      case 'mouse':
        return MdInteractionType.MOUSE;
      case 'touch':
        return MdInteractionType.TOUCH;
    }
  }

  getLastInteractionType(): MdInteractionType {
    return this._lastInteractionType;
  }
}
