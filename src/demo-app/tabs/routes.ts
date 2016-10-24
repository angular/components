import {Routes} from '@angular/router';

import {RoutedContent1, RoutedContent2, RoutedContext3} from '../tabs/tabs-demo';

export const TABS_DEMO_ROUTE: Routes = [
  { path: '', redirectTo: 'content-1', pathMatch: 'full' },
  { path: 'content-1', component: RoutedContent1 },
  { path: 'content-2', component: RoutedContent2 },
  { path: 'content-3', component: RoutedContext3 },
];