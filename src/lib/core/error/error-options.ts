import {InjectionToken} from '@angular/core';
import {NgControl, FormGroupDirective, NgForm} from '@angular/forms';

/** Injection token that can be used to specify the global error options. */
export const MD_ERROR_GLOBAL_OPTIONS =
  new InjectionToken<() => boolean>('md-error-global-options');

export type ErrorStateMatcherType =
  (control: NgControl, parentFormGroup: FormGroupDirective, parentForm: NgForm) => boolean;

export interface ErrorOptions {
  errorStateMatcher?: ErrorStateMatcherType;
  showOnDirty?: boolean;
}
