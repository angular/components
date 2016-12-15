import {Routes} from '@angular/router';
import {SliderOverviewExample} from './slider/overview/slider-overview-example';
import {Examples} from './examples';


export const EXAMPLE_ROUTES: Routes = [
  {path: 'examples', component: Examples},
  {path: 'examples/slider/overview', component: SliderOverviewExample},
];
