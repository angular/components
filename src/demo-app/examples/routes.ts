import {Routes} from '@angular/router';
import {SliderOverviewExample} from './slider/overview/slider-overview-example';
import {Examples} from './examples';
import {SliderConfigurableExample} from './slider/configurable/slider-configurable-example';


export const EXAMPLE_ROUTES: Routes = [
  {path: 'examples', component: Examples},
  {path: 'examples/slider/overview', component: SliderOverviewExample},
  {path: 'examples/slider/configurable', component: SliderConfigurableExample},
];
