/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../behaviors/signal-like/signal-like';
import {RadioGroupInputs, RadioGroupPattern} from './radio-group';
import type {ToolbarPattern} from '../toolbar/toolbar';
import type {ToolbarWidgetGroupControls} from '../toolbar/toolbar-widget-group';

/** Represents the required inputs for a toolbar controlled radio group. */
export type ToolbarRadioGroupInputs<V> = RadioGroupInputs<V> & {
  /** The toolbar controlling the radio group. */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;
};

/** Controls the state of a radio group in a toolbar. */
export class ToolbarRadioGroupPattern<V>
  extends RadioGroupPattern<V>
  implements ToolbarWidgetGroupControls
{
  constructor(override readonly inputs: ToolbarRadioGroupInputs<V>) {
    if (!!inputs.toolbar()) {
      inputs.orientation = inputs.toolbar()!.orientation;
      inputs.skipDisabled = inputs.toolbar()!.skipDisabled;
    }

    super(inputs);
  }

  /** Noop. The toolbar handles keydown events. */
  override onKeydown(_: KeyboardEvent): void {}

  /** Noop. The toolbar handles pointerdown events. */
  override onPointerdown(_: PointerEvent): void {}

  /** Navigates to the next radio button in the group. */
  next(wrap: boolean) {
    this.wrap.set(wrap);
    const item = this.inputs.activeItem();
    this.listBehavior.next();

    const leaveGroup = item === this.inputs.activeItem();
    if (leaveGroup) {
      this.inputs.activeItem.set(undefined);
    }
    this.wrap.set(false);
    return {
      leaveGroup,
    };
  }

  /** Navigates to the previous radio button in the group. */
  prev(wrap: boolean) {
    this.wrap.set(wrap);
    const item = this.inputs.activeItem();
    this.listBehavior.prev();

    const leaveGroup = item === this.inputs.activeItem();
    if (leaveGroup) {
      this.inputs.activeItem.set(undefined);
    }
    this.wrap.set(false);
    return {
      leaveGroup,
    };
  }

  /** Navigates to the first radio button in the group. */
  first() {
    this.listBehavior.first();
  }

  /** Navigates to the last radio button in the group. */
  last() {
    this.listBehavior.last();
  }

  /** Removes focus from the radio group. */
  unfocus() {
    this.inputs.activeItem.set(undefined);
  }

  /** Triggers the action of the currently active radio button in the group. */
  trigger() {
    if (this.readonly()) return;
    this.listBehavior.selectOne();
  }

  /** Navigates to the radio button targeted by a pointer event. */
  goto(e: PointerEvent) {
    this.listBehavior.goto(this.inputs.getItem(e)!, {
      selectOne: !this.readonly(),
    });
  }
}
