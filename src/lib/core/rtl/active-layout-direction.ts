import {LayoutDirection} from './dir';
import {Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';

export class ActiveLayoutDirection {
  dirChange: Observable<any>;
  getActiveDirection(injector: Injector): Promise<LayoutDirection> { return null; }
}
