/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    Component, ContentChildren, EventEmitter, Input, Output, QueryList, OnInit,
    AfterViewChecked, AfterViewInit
} from '@angular/core';
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

export class MdStepper implements AfterViewInit {

    @ContentChildren(MdStep) _steps: QueryList<MdStep>;

    @Input()
    get orientation() { return this._orientation; }
    set orientation(value: string) {
        this._orientation = value;
    }
    private _orientation: string;

    /** The index of the active tab. */
    @Input()
    set selectedIndex(value: number | null) { this._indexToSelect = value; }
    get selectedIndex(): number | null { return this._selectedIndex; }
    private _selectedIndex: number | null = null;
    private _indexToSelect: number | null = null;

    @Output() stepChangeEvent = new EventEmitter<MdStepChangeEvent>();

    selectedStep: MdStep;
    selectedIndex: number = 0;

    ngAfterViewInit() {
        this._steps.toArray()[this.selectedIndex].selected = true;
    }

    selectStep(step: MdStep): void {
        if (!step.active) { return; }
        this.selectedIndex = this.indexOf(step);
        this.stepChangeEvent.emit(this._emitStepChangeEvent());
    }

    indexOf(step: MdStep): number {
        let stepsArray = this._steps.toArray();
        return stepsArray.indexOf(step);
    }

    nextStep(): void {
        this.selectedIndex++;
        this.stepChangeEvent.emit(this._emitStepChangeEvent());
        console.log(this.selectedStep.label);
    }

    private _emitStepChangeEvent(): MdStepChangeEvent {
        const event = new MdStepChangeEvent();
        event.index = this.selectedIndex;
        event.step = this._steps.toArray()[this.selectedIndex];
        this.selectedStep = event.step;
        return event;
    }
}
