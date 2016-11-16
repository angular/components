import { ModuleWithProviders } from '@angular/core';
import { Homepage } from './pages/homepage';
import { ComponentsList } from './pages/components';
import { Routes, RouterModule } from '@angular/router';

const MATERIAL_DOCS_ROUTES: Routes = [
  { path: '', component: Homepage, pathMatch: 'full' },
  { path: 'components', component:  ComponentsList },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(MATERIAL_DOCS_ROUTES);
