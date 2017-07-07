/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TemplatePortal} from '../core/portal/portal';
import {coerceBooleanProperty} from "@angular/cdk";

@Component({
    moduleId: module.id,
    selector: 'mat-step',
    templateUrl: 'step.html',
})
export class MdStep {

    @ViewChild(TemplateRef) stepContent: TemplateRef<any>;
    // @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

    @Input()
    label: string;

    /** Whether the step is optional or not. */
    @Input() optional: boolean = false;

    /** Whether the step is editable or not. */
    @Input() editable: boolean = true;

    isLast: boolean = false;

    /** Whether the step is active. */
    get active() { return this._active; }
    set active(value: boolean) {
        this._active = value;
    }
    private _active: boolean = false;

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

    // /** The portal that will be the hosted content of the step */
    // private _contentPortal: TemplatePortal | null = null;
    // get content(): TemplatePortal | null { return this._contentPortal; }

    // constructor(private _viewContainerRef: ViewContainerRef) {}
    //
    // ngOnInit() {
    //     this._contentPortal = new TemplatePortal(this.stepContent, this._viewContainerRef);
    // }


}
