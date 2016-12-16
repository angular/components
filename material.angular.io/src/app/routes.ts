import {ModuleWithProviders} from '@angular/core';
import {Homepage} from './pages/homepage';
import {ComponentList} from './pages/component-list';
import {Routes, RouterModule} from '@angular/router';
import {ComponentViewer} from './pages/component-viewer/component-viewer';

const MATERIAL_DOCS_ROUTES: Routes = [
  {path: '', component: Homepage, pathMatch: 'full'},
  {path: 'components', component: ComponentList},
  {path: 'component/:id', component: ComponentViewer},
];

export const routing: ModuleWithProviders = RouterModule.forRoot(MATERIAL_DOCS_ROUTES);
