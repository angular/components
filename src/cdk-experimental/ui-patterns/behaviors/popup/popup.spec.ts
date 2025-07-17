/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {PopupTypes, PopupControl, PopupControlInputs} from './popup';

type TestInputs = Partial<Pick<PopupControlInputs, 'expanded'>>;

function getPopupControl(inputs: TestInputs = {}): PopupControl {
  const expanded = inputs.expanded || signal(false);
  const controls = signal('popup-element-id');
  const hasPopup = signal(PopupTypes.LISTBOX);

  return new PopupControl({
    controls,
    expanded,
    hasPopup,
  });
}

describe('Popup Control', () => {
  describe('#open', () => {
    it('should set expanded to true and popup inert to false', () => {
      const control = getPopupControl();

      expect(control.inputs.expanded()).toBeFalse();
      control.open();
      expect(control.inputs.expanded()).toBeTrue();
    });
  });

  describe('#close', () => {
    it('should set expanded to false and popup inert to true', () => {
      const expanded = signal(true);
      const control = getPopupControl({expanded});

      expect(control.inputs.expanded()).toBeTrue();
      control.close();
      expect(control.inputs.expanded()).toBeFalse();
    });
  });

  describe('#toggle', () => {
    it('should toggle expanded and popup inert states', () => {
      const control = getPopupControl();

      expect(control.inputs.expanded()).toBeFalse();
      control.toggle();

      expect(control.inputs.expanded()).toBeTrue();
      control.toggle();

      expect(control.inputs.expanded()).toBeFalse();
    });
  });
});
