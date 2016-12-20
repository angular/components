import {NgModule} from '@angular/core';
import {MaterialModule} from '@angular/material';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';


/**
 * The list of example components.
 * Key is the example name which will be used in `material-docs-example="key"`.
 * Value is the component.
 */

export const EXAMPLE_COMPONENTS = {
  'button-overview': ButtonOverviewExample,
  'button-types': ButtonTypesExample
};

/**
 * The list of all example components.
 * We need to put them in both `declarations` and `entryComponents` to make them work.
 */
export const EXAMPLE_LIST = [
  ButtonOverviewExample,
  ButtonTypesExample,
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    MaterialModule.forRoot(),
  ]
})
export class ExampleModule { }
