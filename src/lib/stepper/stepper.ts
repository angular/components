/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChildren, Input, QueryList} from '@angular/core';
import {MdStep} from './step';

export class MdStepChangeEvent {
    index: number;
    step: MdStep;
}

@Component({
    moduleId: module.id,
    selector: 'mat-stepper',
    templateUrl: 'stepper.html',
    styleUrls: ['stepper.scss'],
    host: {
        '[attr.aria-orientation]': 'orientation'
    },
})

export class MdStepper {

    @ContentChildren(MdStep) _steps: QueryList<MdStep>;

    @Input()
    get orientation() { return this._orientation; }
    set orientation(value: string) {
        this._orientation = value;
    }
    private _orientation: string = "horizontal";

    selectStep(step: MdStep): void {
        step.active = true;
    }
}