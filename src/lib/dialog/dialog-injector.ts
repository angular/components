import {Injector} from '@angular/core';
import {MatDialogRef} from './dialog-ref';


/** Custom injector type specifically for instantiating components with a dialog. */
export class DialogInjector implements Injector {
  constructor(private _dialogRef: MatDialogRef<any>, private _parentInjector: Injector) { }

  get(token: any, notFoundValue?: any): any {
    if (token === MatDialogRef) {
      return this._dialogRef;
    }

    return this._parentInjector.get(token, notFoundValue);
  }
}
