import {Injector} from '@angular/core';
import {MdDialogRef} from './dialog-ref';
import {MdDialogData} from './dialog-config';


/** Custom injector type specifically for instantiating components with a dialog. */
export class DialogInjector implements Injector {
  constructor(
    private _dialogRef: MdDialogRef<any>,
    private _data: MdDialogData,
    private _parentInjector: Injector) { }

  get(token: any, notFoundValue?: any): any {
    if (token === MdDialogRef) {
      return this._dialogRef;
    }

    if (token === MdDialogData && this._data) {
      return this._data;
    }

    return this._parentInjector.get(token, notFoundValue);
  }
}
