/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {TemplatePortal} from '../core';

@Component({
    moduleId: module.id,
    selector: 'mat-step',
    template: ''
})
export class MdStep {
    active: boolean = false;
    isLast: boolean = false;

    /** The portal that will be the hosted content of the step */
    private _contentPortal: TemplatePortal | null = null;
    get content(): TemplatePortal | null { return this._contentPortal; };
}