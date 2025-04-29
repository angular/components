/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Routes} from '@angular/router';
import {CanActivateComponentSidenav} from './pages/component-sidenav/component-sidenav-can-load-guard';

export const MATERIAL_DOCS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/homepage').then(m => m.Homepage),
  },
  {path: 'categories', redirectTo: '/components/categories'},
  {path: 'cdk', pathMatch: 'full', redirectTo: '/cdk/categories'},
  {path: 'components', pathMatch: 'full', redirectTo: '/components/categories'},
  {
    path: 'guides',
    loadComponent: () => import('./pages/guide-list').then(m => m.GuideList),
  },
  // Since https://github.com/angular/components/pull/9574, the cdk-table guide became the overview
  // document for the cdk table. To avoid any dead / broken links, we redirect to the new location.
  {path: 'guide/cdk-table', redirectTo: '/cdk/table/overview'},
  // In v19, the theming system became based on system variables and the mat.theme mixin.
  // The following guides were consolidated into the main theming guide, which redirects
  // users to v18 docs if they are looking for this content.
  {path: 'guide/theming-your-components', redirectTo: '/guide/theming'},
  {path: 'guide/typography', redirectTo: '/guide/theming'},
  {path: 'guide/customizing-component-styles', redirectTo: '/guide/theming'},
  {path: 'guide/elevation', redirectTo: '/guide/theming'},
  {path: 'guide/duplicate-theming-styles', redirectTo: '/guide/theming'},
  {
    path: 'guide/:id',
    loadComponent: () => import('./pages/guide-viewer').then(m => m.GuideViewer),
  },
  // Needs to be defined before `:section` so it gets picked first when redirecting a missing page.
  {
    path: '404',
    loadComponent: () => import('./pages/not-found').then(m => m.NotFound),
  },
  {
    path: ':section',
    canActivate: [CanActivateComponentSidenav],
    loadChildren: () =>
      import('./pages/component-sidenav/component-sidenav').then(m => m.componentSidenavRoutes),
  },
  {path: '**', redirectTo: '/404'},
];
