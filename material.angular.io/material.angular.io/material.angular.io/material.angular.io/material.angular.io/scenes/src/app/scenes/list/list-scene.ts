import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-list-scene',
    templateUrl: './list-scene.html',
    styleUrls: ['./list-scene.scss']
})
export class ListScene {
}

@NgModule({
  imports: [
    MatListModule,
    MatIconModule,
    CommonModule,
  ],
    exports: [ListScene],
    declarations: [ListScene]
})
export class ListSceneModule {
}
