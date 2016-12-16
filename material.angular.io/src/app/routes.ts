import { ModuleWithProviders } from '@angular/core';
import { Homepage } from './pages/homepage';
import { ComponentList } from './pages/component-list';
import { Routes, RouterModule } from '@angular/router';

const MATERIAL_DOCS_ROUTES: Routes = [
  { path: '', component: Homepage, pathMatch: 'full' },
  { path: 'components', component:  ComponentList },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(MATERIAL_DOCS_ROUTES);
