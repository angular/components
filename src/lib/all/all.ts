import {NgModule, ModuleWithProviders} from '@angular/core';
import {MatButtonToggleModule} from '@angular2-material/button-toggle';
import {MatButtonModule} from '@angular2-material/button';
import {MatCheckboxModule} from '@angular2-material/checkbox';
import {MatRadioModule} from '@angular2-material/radio';
import {MatSlideToggleModule} from '@angular2-material/slide-toggle';
import {MatSliderModule} from '@angular2-material/slider';
import {MatSidenavModule} from '@angular2-material/sidenav';
import {MatListModule} from '@angular2-material/list';
import {MatGridListModule} from '@angular2-material/grid-list';
import {MatCardModule} from '@angular2-material/card';
import {MatIconModule} from '@angular2-material/icon';
import {MatProgressCircleModule} from '@angular2-material/progress-circle';
import {MatProgressBarModule} from '@angular2-material/progress-bar';
import {MatInputModule} from '@angular2-material/input';
import {MatTabsModule} from '@angular2-material/tabs';
import {MatToolbarModule} from '@angular2-material/toolbar';
import {MatTooltipModule} from '@angular2-material/tooltip';
import {MatCoreModule} from '@angular2-material/core';
import {MatMenuModule} from '@angular2-material/menu';
import {MatDialogModule} from '@angular2-material/dialog';


const MATERIAL_MODULES = [
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatCoreModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressCircleModule,
  MatRadioModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
];

@NgModule({
  imports: [
    MatButtonModule.forRoot(),
    MatCardModule.forRoot(),
    MatCheckboxModule.forRoot(),
    MatCoreModule.forRoot(),
    MatGridListModule.forRoot(),
    MatInputModule.forRoot(),
    MatListModule.forRoot(),
    MatProgressBarModule.forRoot(),
    MatProgressCircleModule.forRoot(),
    MatSidenavModule.forRoot(),
    MatTabsModule.forRoot(),
    MatToolbarModule.forRoot(),

    // These modules include providers.
    MatButtonToggleModule.forRoot(),
    MatDialogModule.forRoot(),
    MatIconModule.forRoot(),
    MatMenuModule.forRoot(),
    MatRadioModule.forRoot(),
    MatSliderModule.forRoot(),
    MatSlideToggleModule.forRoot(),
    MatTooltipModule.forRoot(),
  ],
  exports: MATERIAL_MODULES,
  providers: []
})
export class MaterialRootModule { }


@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {
  static forRoot(): ModuleWithProviders {
    return {ngModule: MaterialRootModule};
  }
}
