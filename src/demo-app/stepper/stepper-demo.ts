import {Component} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'stepper-demo',
    templateUrl: 'stepper-demo.html',
})
export class StepperDemo {
    steps = [
        {label: 'Step 1', content: 'Content 1'},
        {label: 'Step 2', content: 'Content 2'},
        {label: 'Step 3', content: 'Content 3'},
        ];
}
