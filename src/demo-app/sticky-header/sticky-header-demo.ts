// todo: sticky-header-demo : Lin
import {Component} from '@angular/core';
import {TooltipPosition} from '@angular/material';


@Component({
    moduleId: module.id,
    selector: 'sticky-header-demo',
    templateUrl: 'sticky-header-demo.html',
    styleUrls: ['sticky-header-demo.css'],
})
export class StickyHeaderDemo {
    message: string = 'Here is the ticky-header';
    position: TooltipPosition = 'below';
    disabled = false;
    showDelay = 0;
    hideDelay = 1000;
}
