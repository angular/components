import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SceneViewer } from './scene-viewer/scene-viewer';
import { RipplesScene } from './scenes/ripples/ripples-scene';


const routes: Routes = [
  {path: 'ripples', component: SceneViewer, data: {hueRotate: 120, scene: RipplesScene}},
  {path: 'slider', component: SceneViewer, data: {hueRotate: 135, scene: RipplesScene}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
