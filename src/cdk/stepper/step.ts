/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    Component, ContentChild, Directive, Input, OnInit, TemplateRef, ViewChild,
    ViewContainerRef
} from '@angular/core';
import {CdkStepLabel} from './step-label';

@Component({
    selector: '[cdk-step]',
    templateUrl: 'step.html',
})
export class CdkStep {
    @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;
    @ViewChild(TemplateRef) content: TemplateRef<any>;

    /** Label of the step. */
    @Input()
    label: string;

    /** Whether the step is optional or not. */
    @Input() optional: boolean = false;

    /** Whether the step is editable or not. */
    @Input() editable: boolean = true;

    /** Whether the step is the last one in the list. */
    isLast: boolean = false;

    // /** Whether the step is active. */
    // get active() { return this._active; }
    // set active(value: boolean) {
    //     this._active = value;
    // }
    // private _active: boolean = false;

    /** Whether the step has been selected. */
    get selected(): boolean { return this._selected; }
    set selected(value: boolean) {
        this._selected = value;
    }
    private _selected: boolean = false;

    /** Whether the step has been completed. */
    get completed() { return this._completed; }
    set completed(value: boolean) {
        this._completed = value;
    }
    private _completed: boolean = false;
}
