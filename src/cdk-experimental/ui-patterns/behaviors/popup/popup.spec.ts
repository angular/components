/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ComboboxPopupTypes, PopupControl, PopupControlInputs} from './popup';

type TestInputs = Partial<Pick<PopupControlInputs, 'popup' | 'expanded'>>;

function getPopupControl(inputs: TestInputs = {}): PopupControl {
  const expanded = inputs.expanded || signal(false);
  const popup = signal({inert: signal(!expanded())});
  const controls = signal('popup-element-id');
  const hasPopup = signal(ComboboxPopupTypes.LISTBOX);

  return new PopupControl({
    popup,
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
      expect(control.inputs.popup().inert()).toBeTrue();

      control.open();

      expect(control.inputs.expanded()).toBeTrue();
      expect(control.inputs.popup().inert()).toBeFalse();
    });
  });

  describe('#close', () => {
    it('should set expanded to false and popup inert to true', () => {
      const expanded = signal(true);
      const control = getPopupControl({expanded});

      expect(control.inputs.expanded()).toBeTrue();
      expect(control.inputs.popup().inert()).toBeFalse();

      control.close();

      expect(control.inputs.expanded()).toBeFalse();
      expect(control.inputs.popup().inert()).toBeTrue();
    });
  });

  describe('#toggle', () => {
    it('should toggle expanded and popup inert states', () => {
      const control = getPopupControl();

      expect(control.inputs.expanded()).toBeFalse();
      expect(control.inputs.popup().inert()).toBeTrue();

      control.toggle();

      expect(control.inputs.expanded()).toBeTrue();
      expect(control.inputs.popup().inert()).toBeFalse();

      control.toggle();

      expect(control.inputs.expanded()).toBeFalse();
      expect(control.inputs.popup().inert()).toBeTrue();
    });
  });
});
