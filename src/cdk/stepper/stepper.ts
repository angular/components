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

let nextId = 0;

export class CdkStepEvent {
    index: number;
    step: CdkStep;
}

@Directive({
    selector: '[cdkStepper]',
    host: {
        //'(focus)': '_onFocus()',
        '(keydown)': '_onKeydown($event)'
    },
})
export class CdkStepper {

    get focusIndex(): number {return this._focusIndex; }
    private _focusIndex: number = 0;

    @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

    @ViewChildren('stepHeader') _stepHeader: QueryList<ElementRef>;

    @ViewChildren('stepButton') _stepButton: QueryList<ElementRef>;

    /** The index of the currently selected step. */
    @Input()
    set selectedIndex(value: number) {
        this._selectedIndex = value;
        //this.selectedStep = this._steps.toArray()[this._selectedIndex];
        //this.stepEvent.emit(this._emitstepEvent());
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

    @Output() focusChange = new EventEmitter<CdkStepEvent>();

    get selectedStep(): CdkStep {
        return this._steps.toArray()[this._selectedIndex];
    }
    private _selectedStep: CdkStep;

    private _groupId: number;

    constructor() {
        this._groupId = nextId++;
    }
    // _keyManager: FocusKeyManager;

    //selectedIndex: number = 0;

    // ngAfterContentChecked() {
    //     this._steps.toArray()[this._selectedIndex].selected = true;
    // }

    // constructor(private _element: ElementRef) { }
    //
    // ngAfterContentInit(): void {
    //     this._keyManager = new FocusKeyManager(this._steps).withWrap();
    // }

    selectStep(step: CdkStep): void {
        //if (!step.active) { return; }
        this._selectedIndex = this.indexOf(step);
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    indexOf(step: CdkStep): number {
        let stepsArray = this._steps.toArray();
        return stepsArray.indexOf(step);
    }

    nextStep(): void {
        if (this._selectedIndex == this._steps.length - 1) { return; }
        this._selectedIndex++;
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    previousStep(): void {
        if (this._selectedIndex == 0) { return; }
        this._selectedIndex--;
        this.stepEvent.emit(this._emitStepEvent(this._selectedIndex));
        this._focusIndex = this._selectedIndex;
        this._setStepFocus();
    }

    _getStepLabelId(i: number): string {
        return `mat-step-label-${this._groupId}-${i}`;
    }

    _getStepContentId(i: number): string {
        return `mat-step-content-${this._groupId}-${i}`;
    }

    private _emitStepEvent(index: number): CdkStepEvent {
        const event = new CdkStepEvent();
        event.index = index;
        event.step = this._steps.toArray()[this._selectedIndex];
        this._selectedStep = event.step;
        //this._focusIndex = this._selectedIndex;
        //this._setStepFocus();
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
        if (event.keyCode != TAB) event.preventDefault();
    }

    _setStepFocus() {
        this._stepHeader.toArray()[this._focusIndex].nativeElement.focus();
        this.focusChange.emit(this._emitStepEvent(this._selectedIndex));
    }

    // _onFocus() {
    //     //this._keyManager.setFirstItemActive();
    //     this._element.nativeElement.focus();
    // }
}
