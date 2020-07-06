import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatListModule} from '@angular/material/list';

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
    ],
    exports: [ListScene],
    declarations: [ListScene]
})
export class ListSceneModule {
}
