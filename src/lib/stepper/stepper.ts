/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChildren, Input, QueryList} from '@angular/core';
import {MdStep} from './step';
import {TemplatePortal} from '../core';

export class MdStepChangeEvent {
    index: number;
    step: MdStep;
}

@Component({
    moduleId: module.id,
    selector: 'mat-stepper',
    templateUrl: 'stepper.html',
    //styleUrls: ['stepper.scss'],
    host: {
        '[attr.aria-orientation]': 'orientation',
    },
})

export class MdStepper {

    @ContentChildren(MdStep) _steps: QueryList<MdStep>;

    // @Input('content') _content: TemplatePortal;

    @Input()
    get orientation() { return this._orientation; }
    set orientation(value: string) {
        this._orientation = value;
    }
    private _orientation: string;

    activeStep: MdStep;

    selectStep(step: MdStep): void {
        step.active = true;
        this.activeStep = step;
    }

    indexOf(step: MdStep): number {
        let stepsArray = this._steps.toArray();
        return stepsArray.indexOf(step);
    }
}
