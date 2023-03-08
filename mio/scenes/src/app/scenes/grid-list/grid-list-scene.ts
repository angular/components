import {CommonModule} from '@angular/common';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-grid-list-scene',
  templateUrl: './grid-list-scene.html',
  styleUrls: ['./grid-list-scene.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GridListScene {
  tiles = [
    {cols: 3, rows: 1, color: '#f11'},
    {cols: 1, rows: 2, color: '#f77'},
    {cols: 1, rows: 1, color: '#c11'},
    {cols: 2, rows: 1, color: '#d66'},
  ];
}

@NgModule({
  imports: [
    MatGridListModule,
    CommonModule
  ],
  exports: [GridListScene],
  declarations: [GridListScene],
})
export class GridListSceneModule {}

