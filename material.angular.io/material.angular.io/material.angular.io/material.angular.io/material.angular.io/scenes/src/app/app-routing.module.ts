import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SceneViewer } from './scene-viewer/scene-viewer';
import { RipplesScene } from './scenes/ripples/ripples-scene';
import { InputScene } from './scenes/input/input-scene';
import { ButtonToggleScene } from './scenes/button-toggle/button-toggle-scene';
import {SliderScene} from './scenes/slider/slider-scene';


const routes: Routes = [
  {path: 'ripples', component: SceneViewer, data: {hueRotate: 120, scene: RipplesScene}},
  {path: 'slider', component: SceneViewer, data: {hueRotate: 135, scene: SliderScene}},
  {path: 'input', component: SceneViewer, data: {hueRotate: 45, scale: 0.7, scene: InputScene}},
  {
    path: 'button-toggle',
    component: SceneViewer,
    data: {hueRotate: 135, scale: 1.5, scene: ButtonToggleScene}
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
