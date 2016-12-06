import {Injectable} from '@angular/core';


@Injectable()
export class MdFeatureDetector {
  /** @returns {Set<string>} the input types supported by this browser. */
  get supportedInputTypes(): Set<string> {
    if (!this._supportedInputTypes) {
      let featureTestInput = document.createElement('input');
      this._supportedInputTypes = new Set([
        'button',
        'checkbox',
        'color',
        'date',
        'datetime-local',
        'email',
        'file',
        'hidden',
        'image',
        'month',
        'number',
        'password',
        'radio',
        'range',
        'reset',
        'search',
        'submit',
        'tel',
        'text',
        'time',
        'url',
        'week',
      ].filter(value => {
        featureTestInput.setAttribute('type', value);
        return featureTestInput.type === value;
      }));
    }
    return this._supportedInputTypes;
  }
  private _supportedInputTypes: Set<string>;
}
