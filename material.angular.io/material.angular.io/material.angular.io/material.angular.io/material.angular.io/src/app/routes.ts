import {Homepage} from './pages/homepage';
import {ComponentList} from './pages/component-list';
import {GuideList} from './pages/guide-list';
import {Routes} from '@angular/router';
import {
  ComponentApi,
  ComponentExamples,
  ComponentOverview,
  ComponentViewer
} from './pages/component-viewer/component-viewer';
import {ComponentCategoryList} from './pages/component-category-list/component-category-list';
import {ComponentSidenav} from './pages/component-sidenav/component-sidenav';
import {
  CanActivateComponentSidenav
} from './pages/component-sidenav/component-sidenav-can-load-guard';
import {GuideViewer} from './pages/guide-viewer/guide-viewer';

export const MATERIAL_DOCS_ROUTES: Routes = [
  {path: '', component: Homepage, pathMatch: 'full', data: {}},
  {path: 'categories', redirectTo: '/components/categories'},
  {path: 'guides', component: GuideList, data: {}},
  {path: 'guide/:id', component: GuideViewer, data: {}},
  {
    path: ':section',
    canActivate: [CanActivateComponentSidenav],
    component: ComponentSidenav,
    children: [
      {path: '', redirectTo: 'categories', pathMatch: 'full'},
      {path: 'component/:id', redirectTo: ':id', pathMatch: 'full'},
      {path: 'category/:id', redirectTo: '/categories/:id', pathMatch: 'full'},
      {
        path: 'categories',
        children: [
          {path: '', component: ComponentCategoryList},
          {path: ':id', component: ComponentList},
        ],
      },
      {
        path: ':id',
        component: ComponentViewer,
        children: [
          {path: '', redirectTo: 'overview', pathMatch: 'full'},
          {path: 'overview', component: ComponentOverview, pathMatch: 'full'},
          {path: 'api', component: ComponentApi, pathMatch: 'full'},
          {path: 'examples', component: ComponentExamples, pathMatch: 'full'},
          {path: '**', redirectTo: 'overview'},
        ],
      },
    ],
  },
  {path: '**', redirectTo: ''},
];
