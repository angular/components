/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef, ViewContainerRef} from '@angular/core';
import {CdkStepLabel} from '@angular/cdk';
@Directive({
    selector: '[md-step-label], [mat-step-label]',
})
export class MdStepLabel extends CdkStepLabel {
    constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
        super(templateRef, viewContainerRef);
    }
}
