/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {LabelControl, LabelControlInputs, LabelControlOptionalInputs} from './label';

// This is a helper type for the initial values passed to the setup function.
type TestInputs = Partial<{
  label: string | undefined;
  defaultLabelledBy: string[];
  labelledBy: string[];
}>;

type TestLabelControlInputs = LabelControlInputs & Required<LabelControlOptionalInputs>;

// This is a helper type to make all properties of LabelControlInputs writable signals.
type WritableLabelControlInputs = {
  [K in keyof TestLabelControlInputs]: WritableSignal<
    TestLabelControlInputs[K] extends {(): infer T} ? T : never
  >;
};

function getLabelControl(initialValues: TestInputs = {}): {
  control: LabelControl;
  inputs: WritableLabelControlInputs;
} {
  const inputs: WritableLabelControlInputs = {
    defaultLabelledBy: signal(initialValues.defaultLabelledBy ?? []),
    label: signal(initialValues.label),
    labelledBy: signal(initialValues.labelledBy ?? []),
  };

  const control = new LabelControl(inputs);

  return {control, inputs};
}

describe('LabelControl', () => {
  describe('#label', () => {
    it('should return the user-provided label', () => {
      const {control} = getLabelControl({label: 'My Label'});
      expect(control.label()).toBe('My Label');
    });

    it('should return undefined if no label is provided', () => {
      const {control} = getLabelControl();
      expect(control.label()).toBeUndefined();
    });

    it('should update when the input signal changes', () => {
      const {control, inputs} = getLabelControl({label: 'Initial Label'});
      expect(control.label()).toBe('Initial Label');

      inputs.label.set('Updated Label');
      expect(control.label()).toBe('Updated Label');
    });
  });

  describe('#labelledBy', () => {
    it('should return user-provided labelledBy even if a label is provided', () => {
      const {control} = getLabelControl({
        label: 'My Label',
        defaultLabelledBy: ['default-id'],
        labelledBy: ['user-id'],
      });
      expect(control.labelledBy()).toEqual(['user-id']);
    });

    it('should return defaultLabelledBy if no user-provided labelledBy exists', () => {
      const {control} = getLabelControl({defaultLabelledBy: ['default-id']});
      expect(control.labelledBy()).toEqual(['default-id']);
    });

    it('should update when label changes from undefined to a string', () => {
      const {control, inputs} = getLabelControl({
        defaultLabelledBy: ['default-id'],
      });
      expect(control.labelledBy()).toEqual(['default-id']);
      inputs.label.set('A wild label appears');
      expect(control.labelledBy()).toEqual([]);
    });
  });
});
