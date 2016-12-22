import {ModuleWithProviders} from '@angular/core';
import {Homepage} from './pages/homepage';
import {ComponentList} from './pages/component-list';
import {GuideList} from './pages/guide-list';
import {Routes, RouterModule} from '@angular/router';
import {ComponentViewer} from './pages/component-viewer/component-viewer';
import {ComponentCategoryList} from './pages/component-category-list/component-category-list';
import {ComponentSidenav} from './pages/component-sidenav/component-sidenav';
import {GuideViewer} from './pages/guide-viewer/guide-viewer';

const MATERIAL_DOCS_ROUTES: Routes = [
  {path: '', component: Homepage, pathMatch: 'full'},
  {
    path: 'components',
    component: ComponentSidenav,
    children: [
      {path: '', component: ComponentCategoryList},
      {path: 'category/:id', component: ComponentList},
      {path: 'component/:id', component: ComponentViewer},
    ],
  },
  {path: 'guides', component: GuideList},
  {path: 'guide/:id', component: GuideViewer},
];

export const routing: ModuleWithProviders = RouterModule.forRoot(MATERIAL_DOCS_ROUTES);
