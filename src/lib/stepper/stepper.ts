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
import {Observable} from 'rxjs/Observable';
import {map} from '../core/rxjs/index';

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
        '[attr.aria-orientation]': 'orientation',
    },
})

export class MdStepper {

    @ContentChildren(MdStep) _steps: QueryList<MdStep>;

    /** Orientation of the stepper component. */
    @Input()
    get orientation() { return this._orientation; }
    set orientation(value: string) {
        this._orientation = value;
    }
    private _orientation: string;

    /** The index of the currently selected step. */
    @Input()
    set selectedIndex(value: number) {
        this._selectedIndex = value;
        //this.selectedStep = this._steps.toArray()[this._selectedIndex];
        //this.stepChangeEvent.emit(this._emitStepChangeEvent());
    }
    get selectedIndex(): number { return this._selectedIndex; }
    private _selectedIndex: number;

    /** Optional input to support both linear and non-linear stepper component. */
    @Input() linear: boolean = true;

    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    @Output() get selectedIndexChange(): Observable<number> {
        return map.call(this.stepChangeEvent, event => event.index);
    }

    /** Event emitted when the selected step has changed. */
    @Output() stepChangeEvent = new EventEmitter<MdStepChangeEvent>();

    get selectedStep(): MdStep {
        return this._steps.toArray()[this._selectedIndex];
    }
    private _selectedStep: MdStep;

    //selectedIndex: number = 0;

    // ngAfterContentChecked() {
    //     this._steps.toArray()[this._selectedIndex].selected = true;
    // }

    selectStep(step: MdStep): void {
        if (!step.active) { return; }
        this._selectedIndex = this.indexOf(step);
        this.stepChangeEvent.emit(this._emitStepChangeEvent());
    }

    indexOf(step: MdStep): number {
        let stepsArray = this._steps.toArray();
        return stepsArray.indexOf(step);
    }

    nextStep(): void {
        if (this._selectedIndex == this._steps.length - 1) { return; }
        this._selectedIndex++;
        this.stepChangeEvent.emit(this._emitStepChangeEvent());
    }

    previousStep(): void {
        if (this._selectedIndex == 0) { return; }
        this._selectedIndex--;
        this.stepChangeEvent.emit(this._emitStepChangeEvent());
    }

    private _emitStepChangeEvent(): MdStepChangeEvent {
        const event = new MdStepChangeEvent();
        event.index = this._selectedIndex;
        event.step = this._steps.toArray()[this._selectedIndex];
        this._selectedStep = event.step;
        return event;
    }
}
