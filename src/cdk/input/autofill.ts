/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, EventEmitter, Injectable, OnDestroy, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


/** An event that is emitted when the autofill state of an input changes. */
export type AutofillEvent = {
  target: Element;
  isAutofilled: boolean;
};


/** Used to track info about currently monitored elements. */
type MonitoredElementInfo = {
  subject: Subject<AutofillEvent>;
  unlisten: () => void;
};


/**
 * An injectable service that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
@Injectable()
export class AutofillMonitor implements OnDestroy {
  private _monitoredElements = new Map<Element, MonitoredElementInfo>();

  monitor(element: Element): Observable<AutofillEvent> {
    const info = this._monitoredElements.get(element);
    if (info) {
      return info.subject.asObservable();
    }

    const result = new Subject<AutofillEvent>();
    const listener = (event: AnimationEvent) => {
      if (event.animationName === 'cdk-input-autofill-start') {
        element.classList.add('cdk-input-autofilled');
        result.next({target: event.target as Element, isAutofilled: true});
      } else if (event.animationName === 'cdk-input-autofill-end') {
        element.classList.remove('cdk-input-autofilled');
        result.next({target: event.target as Element, isAutofilled: false});
      }
    };

    element.addEventListener('animationstart', listener);
    element.classList.add('cdk-input-autofill-monitored');

    this._monitoredElements.set(element, {
      subject: result,
      unlisten: () => {
        element.removeEventListener('animationstart', listener);
      }
    });

    return result.asObservable();
  }

  stopMonitoring(element: Element) {
    const info = this._monitoredElements.get(element);
    if (info) {
      info.unlisten();
      element.classList.remove('cdk-input-autofill-monitored');
      element.classList.remove('cdk-input-autofilled');
      this._monitoredElements.delete(element);
    }
  }

  ngOnDestroy() {
    this._monitoredElements.forEach(info => {
      info.unlisten();
      info.subject.complete();
    });
  }
}


/** A directive that can be used to monitor the autofill state of an input. */
@Directive({
  selector: '[cdkAutofill]',
})
export class CdkAutofill implements OnDestroy {
  @Output() cdkAutofill = new EventEmitter<AutofillEvent>();

  constructor(private _elementRef: ElementRef, private _autofillMonitor: AutofillMonitor) {
    this._autofillMonitor.monitor(this._elementRef.nativeElement)
        .subscribe(event => this.cdkAutofill.emit(event));
  }

  ngOnDestroy() {
    this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement);
  }
}
