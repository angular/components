import {Routes} from '@angular/router';
import {SliderOverviewExample} from './slider/overview/slider-overview-example';
import {Examples} from './examples';
import {SliderConfigurableExample} from './slider/configurable/slider-configurable-example';
import {SidenavOverviewExample} from './sidenav/overview/sidenav-overview-example';
import {SidenavFabExample} from './sidenav/fab/sidenav-fab-example';
import {InputOverviewExample} from './input/overview/input-overview-example';
import {InputFormExample} from './input/form/input-form-example';
import {ButtonOverviewExample} from './button/overview/button-overview-example';
import {ButtonTypesExample} from './button/types/button-types-example';
import {CardOverviewExample} from './card/overview/card-overview-example';
import {CardFancyExample} from './card/fancy/card-fancy-example';
import {CheckboxOverviewExample} from './checkbox/overview/checkbox-overview-example';
import {CheckboxConfigurableExample} from './checkbox/configurable/checkbox-configurable-example';


export const EXAMPLE_ROUTES: Routes = [
  {path: 'examples', component: Examples},
  {path: 'examples/slider/overview', component: SliderOverviewExample},
  {path: 'examples/slider/configurable', component: SliderConfigurableExample},
  {path: 'examples/sidenav/overview', component: SidenavOverviewExample},
  {path: 'examples/sidenav/fab', component: SidenavFabExample},
  {path: 'examples/input/overview', component: InputOverviewExample},
  {path: 'examples/input/form', component: InputFormExample},
  {path: 'examples/button/overview', component: ButtonOverviewExample},
  {path: 'examples/button/types', component: ButtonTypesExample},
  {path: 'examples/card/overview', component: CardOverviewExample},
  {path: 'examples/card/fancy', component: CardFancyExample},
  {path: 'examples/checkbox/overview', component: CheckboxOverviewExample},
  {path: 'examples/checkbox/configurable', component: CheckboxConfigurableExample},
];
