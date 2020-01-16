import {Routes} from '@angular/router';
import {CanActivateComponentSidenav} from './pages/component-sidenav/component-sidenav-can-load-guard';

export const MATERIAL_DOCS_ROUTES: Routes = [
  {
    path: '', pathMatch: 'full',
    loadChildren: () => import('./pages/homepage').then(m => m.HomepageModule)
  },
  {path: 'categories', redirectTo: '/components/categories'},
  {
    path: 'guides',
    loadChildren: () => import('./pages/guide-list').then(m => m.GuideListModule)
  },
  // Since https://github.com/angular/components/pull/9574, the cdk-table guide became the overview
  // document for the cdk table. To avoid any dead / broken links, we redirect to the new location.
  {path: 'guide/cdk-table', redirectTo: '/cdk/table/overview'},
  {
    path: 'guide/:id',
    loadChildren: () => import('./pages/guide-viewer').then(m => m.GuideViewerModule)
  },
  {
    path: ':section',
    canActivate: [CanActivateComponentSidenav],
    loadChildren: () =>
      import('./pages/component-sidenav/component-sidenav').then(m => m.ComponentSidenavModule)
  },
  {path: '**', redirectTo: ''},
];
