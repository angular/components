import {Component} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'stepper-demo',
    templateUrl: 'stepper-demo.html',
    //styleUrls: ['stepper-demo.scss'],
})
export class StepperDemo {
    verticalActiveIndex = 0;
    horizontalActiveIndex = 0;
    steps = [
        {label: 'Step 1', content: 'Content 1'},
        {label: 'Step 2', content: 'Content 2', optional: true},
        {label: 'Step 3', content: 'Content 3', editable: false},
        ];
}
