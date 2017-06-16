
import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';

import {Component, ElementRef, Output, EventEmitter, Optional} from '@angular/core';
import {ScrollDispatchModule, Scrollable, MdStickyHeaderModule, StickyParentDirective, StickyHeaderDirective} from '@angular/material';


@Component({
    moduleId: module.id,
    selector: 'sticky-header-e2e',
    templateUrl: 'sticky-header-e2e.html',
})
export class StickyHeaderE2E {
    constructor(private elementRef: ElementRef) {

    }


    testScroll() {
        let element = this.elementRef.nativeElement.querySelector('#sticky-header');
        let elementParent = this.elementRef.nativeElement.querySelector('#sticky-region');
        elementParent.style.setProperty('zIndex', 99);
        elementParent.style.setProperty('position', 'absolute');
        elementParent.style.setProperty('top', '-10');
        element.nativeElement.onScroll();
    }


    testTouchmove() {

    }
}



