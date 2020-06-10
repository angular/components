import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SceneViewer } from './scene-viewer/scene-viewer';
import { RipplesScene } from './scenes/ripples/ripples-scene';
import { InputScene } from './scenes/input/input-scene';


const routes: Routes = [
  {path: 'ripples', component: SceneViewer, data: {hueRotate: 120, scene: RipplesScene}},
  {path: 'slider', component: SceneViewer, data: {hueRotate: 135, scene: RipplesScene}},
  {path: 'input', component: SceneViewer, data: {hueRotate: 45, scale: 0.7, scene: InputScene}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
