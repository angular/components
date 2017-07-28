import {Component} from '@angular/core';
import {
  Validators, FormBuilder, FormGroup, FormArray, ValidationErrors, ValidatorFn
} from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'stepper-demo',
  templateUrl: 'stepper-demo.html',
  styleUrls: ['stepper-demo.scss'],
})
export class StepperDemo {
  formGroup: FormGroup;

  steps = [
    {label: 'Confirm your name', content: 'Last name, First name.'},
    {label: 'Confirm your contact information', content: '123-456-7890'},
    {label: 'Confirm your address', content: '1600 Amphitheater Pkwy MTV'},
    {label: 'You are now done', content: 'Finished!'}
  ];

  /** Returns a FormArray with the name 'formArray'. */
  get formArray() { return this.formGroup.get('formArray'); }

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formGroup = this._formBuilder.group({
      formArray: this._formBuilder.array([
        this._formBuilder.group({
          firstNameFormCtrl: ['', Validators.required],
          lastNameFormCtrl: ['', Validators.required],
        }),
        this._formBuilder.group({
          phoneFormCtrl: [''],
        })
      ], this._stepValidator)
    });
  }

  /**
   * Form array validator to check if all form groups in form array are valid.
   * If not, it will return the index of the first invalid form group.
   */
  private _stepValidator: ValidatorFn = (formArray: FormArray): ValidationErrors | null => {
    for (let i = 0; i < formArray.length; i++) {
      if (formArray.at(i).invalid) {
        return {'invalid step': {'index': i}};
      }
    }
    return null;
  }
}
