import {CommonModule} from '@angular/common';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatSortModule} from '@angular/material/sort';

export interface Dessert {
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-sort-scene',
  templateUrl: './sort-scene.html',
  styleUrls: ['./sort-scene.scss']
})
export class SortScene {
  desserts: Dessert[] = [
    {name: 'Cupcake', calories: 305, fat: 4, carbs: 67, protein: 4},
    {name: 'Eclair', calories: 262, fat: 16, carbs: 24, protein: 6},
    {name: 'Frozen yogurt', calories: 159, fat: 6, carbs: 24, protein: 4},
  ];
}

@NgModule({
  imports: [
    CommonModule,
    MatSortModule
  ],
  exports: [SortScene],
  declarations: [SortScene]
})
export class SortSceneModule {
}

