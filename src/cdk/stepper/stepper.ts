/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    Component, ContentChildren, EventEmitter, Input, Output, QueryList, OnInit,
    AfterViewChecked, AfterViewInit, Directive, ElementRef, ViewChild, ViewChildren
} from '@angular/core';
import {CdkStep} from './step';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';
import {LEFT_ARROW, RIGHT_ARROW, ENTER, TAB} from '../keyboard/keycodes';

/** Used to generate unique ID for each stepper component. */
let nextId = 0;

/** Change event emitted on focus or selection changes. */
export class CdkStepEvent {
    index: number;
    step: CdkStep;
}

@Directive({
    selector: '[cdkStepper]',
    host: {
        '(keydown)': '_onKeydown($event)'
    },
})
export class CdkStepper {
    @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

    @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;

    /** The index of the currently selected step. */
    @Input()
    set selectedIndex(value: number) {
        this._selectedIndex = value;
    }
    get selectedIndex(): number { return this._selectedIndex; }
    private _selectedIndex: number;

    /** Optional input to support both linear and non-linear stepper component. */
    @Input() linear: boolean = true;

    /** Output to enable support for two-way binding on `[(selectedIndex)]` */
    @Output() get selectedIndexChange(): Observable<number> {
        return map.call(this.stepEvent, event => event.index);
    }

    // @Output() get focusIndexChange(): Observable<number> {
    //     return map.call(this.focusChange, event => event.index);
    // }

    /** Event emitted when the selected step has changed. */
    @Output() stepEvent = new EventEmitter<CdkStepEvent>();

    /** Event emitted when the focused step has changed. */
    @Output() focusChange = new EventEmitter<CdkStepEvent>();

    /** The step that is currently selected. */
    get selectedStep(): CdkStep {
        return this._steps.toArray()[this._selectedIndex];
    }
    private _selectedStep: CdkStep;

    /** The index of the step that the focus is currently on. */
    get focusIndex(): number {return this._focusIndex; }
    private _focusIndex: number = 0;

    private _groupId: number;

    constructor() {
        this._groupId = nextId++;
    }

    /** Selects and focuses the provided step. */
    selectStep(step: CdkStep): void {
        let stepsArray = this._steps.toArray();
        this._selectedIndex = stepsArray.indexOf(step);
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    /** Selects and focuses the next step in list. */
    nextStep(): void {
        if (this._selectedIndex == this._steps.length - 1) { return; }
        this._selectedIndex++;
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    /** Selects and focuses the previous step in list. */
    previousStep(): void {
        if (this._selectedIndex == 0) { return; }
        this._selectedIndex--;
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    /** Returns a unique id for each step label element. */
    _getStepLabelId(i: number): string {
        return `mat-step-label-${this._groupId}-${i}`;
    }

    /** Returns a unique id for each step content element. */
    _getStepContentId(i: number): string {
        return `mat-step-content-${this._groupId}-${i}`;
    }

    private _emitStepEvent(index: number): CdkStepEvent {
        const event = new CdkStepEvent();
        event.index = index;
        event.step = this._steps.toArray()[this._selectedIndex];
        this._selectedStep = event.step;
        return event;
    }

    _onKeydown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case RIGHT_ARROW:
                if (this._focusIndex != this._steps.length - 1) {
                    this._focusIndex++;
                    this._setStepFocus();
                }
                break;
            case LEFT_ARROW:
                if (this._focusIndex != 0) {
                    this._focusIndex--;
                    this._setStepFocus();
                }
                break;
            case ENTER:
                this._selectedIndex = this._focusIndex;
                this._emitStepEvent(this._selectedIndex);
                break;
        }
        if (event.keyCode != TAB) {
            event.preventDefault();
        }
    }

    _setStepFocus() {
        this._stepHeader.toArray()[this._focusIndex].nativeElement.focus();
        this.focusChange.emit(this._emitStepEvent(this._selectedIndex));
    }
}
