import {Routes} from '@angular/router';
import {SimpleSliderExample} from './slider/simple/simple-slider-example';
import {Examples} from './examples';


export const EXAMPLE_ROUTES: Routes = [
  {path: 'examples', component: Examples},
  {path: 'examples/simple-slider', component: SimpleSliderExample},
];
