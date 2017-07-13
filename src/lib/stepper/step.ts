import {Component, ContentChild, TemplateRef, ViewChild} from "@angular/core";
import {CdkStep} from "@angular/cdk";
import {MdStepLabel} from "./step-label";
@Component({
    moduleId: module.id,
    selector: 'mat-step',
    templateUrl: 'step.html',
    //viewProviders: [CdkStep],
    inputs: ['label'],
})
export class MdStep extends CdkStep {
    /** Content for the step label given by <ng-template mat-step-label>. */
    @ContentChild(MdStepLabel) stepLabel: MdStepLabel;

    /** Template inside the MdStep view that contains an <ng-content>. */
    @ViewChild(TemplateRef) content: TemplateRef<any>;
}