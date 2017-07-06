/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TemplatePortal} from '../core/portal/portal';

@Component({
    moduleId: module.id,
    selector: 'mat-step',
    templateUrl: 'step.html',
})
export class MdStep {

    @ViewChild(TemplateRef) stepContent: TemplateRef<any>;
    // @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

    @Input()
    get active() { return this._active; }
    set active(value: boolean) {
        this._active = value;
    }
    private _active: boolean = true;

    @Input()
    label: string;

    @Input()
    get completed() { return this._completed; }
    set completed(value: boolean) {
        this._completed = value;
    }
    private _completed: boolean = false;

    isLast: boolean = false;

    private _selected: boolean = false;
    set selected(value: boolean) {
        this._selected = value;
    }
    get selected(): boolean { return this._selected; }

    // /** The portal that will be the hosted content of the step */
    // private _contentPortal: TemplatePortal | null = null;
    // get content(): TemplatePortal | null { return this._contentPortal; }

    // constructor(private _viewContainerRef: ViewContainerRef) {}
    //
    // ngOnInit() {
    //     this._contentPortal = new TemplatePortal(this.stepContent, this._viewContainerRef);
    // }


}
