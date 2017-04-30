import {coerceBooleanProperty} from '../coercion/boolean-property';


/** @docs-private */
export type Constructor<T> = new(...args: any[]) => T;

/** @docs-private */
export interface CanDisable {
  disabled: boolean;
  withDisabledParent: (parent: CanDisable) => CanDisable;
}

/** Mixin to augment a directive with a `disabled` property. */
export function mixinDisabled<T extends Constructor<{}>>(base: T): Constructor<CanDisable> & T {
  return class extends base {
    private _parent: CanDisable = null;
    private _disabled: boolean = false;

    get disabled() {
      return (this._parent && this._parent.disabled) || this._disabled;
    }
    set disabled(value: any) {
      this._disabled = coerceBooleanProperty(value);
    }

    /**
     * Sets the parent from which to inherit the disabled state.
     * @param parent Parent to inherit from.
    */
    withDisabledParent(parent: CanDisable): this {
      this._parent = parent;
      return this;
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
