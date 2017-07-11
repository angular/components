/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    Component, ContentChildren, EventEmitter, Input, Output, QueryList, OnInit,
    AfterViewChecked, AfterViewInit, Directive, ElementRef
} from '@angular/core';
import {CdkStep} from './step';
import {TemplatePortal} from '../core';
import {Observable} from 'rxjs/Observable';
import {map} from '../core/rxjs/index';
import {LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';

export class CdkStepEvent {
    index: number;
    step: CdkStep;
}

@Directive({
    selector: '[cdkStepper]',
    // host: {
    //     '(focus)': '_onFocus()',
    //     '(keydown)': '_onKeydown($event)'
    // },
})
export class CdkStepper {

    @ContentChildren(CdkStep) _steps: QueryList<CdkStep>;

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

    /** Event emitted when the selected step has changed. */
    @Output() stepEvent = new EventEmitter<CdkStepEvent>();

    get selectedStep(): CdkStep {
        return this._steps.toArray()[this._selectedIndex];
    }
    private _selectedStep: CdkStep;
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
        if (!step.active) { return; }
        this._selectedIndex = this.indexOf(step);
        this.stepEvent.emit(this._emitStepEvent());
    }

    indexOf(step: CdkStep): number {
        let stepsArray = this._steps.toArray();
        return stepsArray.indexOf(step);
    }

    nextStep(): void {
        if (this._selectedIndex == this._steps.length - 1) { return; }
        this._selectedIndex++;
        this.stepEvent.emit(this._emitStepEvent());
    }

    previousStep(): void {
        if (this._selectedIndex == 0) { return; }
        this._selectedIndex--;
        this.stepEvent.emit(this._emitStepEvent());
    }

    private _emitStepEvent(): CdkStepEvent {
        const event = new CdkStepEvent();
        event.index = this._selectedIndex;
        event.step = this._steps.toArray()[this._selectedIndex];
        this._selectedStep = event.step;
        return event;
    }

    // _onKeyDown(event: KeyboardEvent) {
    //     switch (event.keyCode) {
    //         case RIGHT_ARROW:
    //             ;
    //         case LEFT_ARROW:
    //             ;
    //     }
    //     event.preventDefault();
    // }
    // _onFocus() {
    //     //this._keyManager.setFirstItemActive();
    //     this._element.nativeElement.focus();
    // }
}
