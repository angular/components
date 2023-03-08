import {ComponentType} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SceneViewer} from './scene-viewer/scene-viewer';
import {AutocompleteScene} from './scenes/autocomplete/autocomplete-scene';
import {BadgeScene} from './scenes/badge/badge-scene';
import {BottomSheetScene} from './scenes/bottom-sheet/bottom-sheet-scene';
import {ButtonToggleScene} from './scenes/button-toggle/button-toggle-scene';
import {ButtonScene} from './scenes/button/button-scene';
import {CardScene} from './scenes/card/card-scene';
import {CheckboxScene} from './scenes/checkbox/checkbox-scene';
import {ChipsScene} from './scenes/chips/chips-scene';
import {CoreScene} from './scenes/core/core-scene';
import {DatepickerScene} from './scenes/datepicker/datepicker-scene';
import {DialogScene} from './scenes/dialog/dialog-scene';
import {DividerScene} from './scenes/divider/divider-scene';
import {ExpansionScene} from './scenes/expansion/expansion-scene';
import {FormFieldScene} from './scenes/form-field/form-field-scene';
import {GridListScene} from './scenes/grid-list/grid-list-scene';
import {IconScene} from './scenes/icon/icon-scene';
import {InputScene} from './scenes/input/input-scene';
import {ListScene} from './scenes/list/list-scene';
import {MenuScene} from './scenes/menu/menu-scene';
import {PaginatorScene} from './scenes/paginator/paginator-scene';
import {ProgressBarScene} from './scenes/progress-bar/progress-bar-scene';
import {ProgressSpinnerScene} from './scenes/progress-spinner/progress-spinner-scene';
import {RadioScene} from './scenes/radio/radio-scene';
import {RipplesScene} from './scenes/ripples/ripples-scene';
import {SelectScene} from './scenes/select/select-scene';
import {SidenavScene} from './scenes/sidenav/sidenav-scene';
import {SlideToggleScene} from './scenes/slide-toggle/slide-toggle-scene';
import {SliderScene} from './scenes/slider/slider-scene';
import {SnackBarScene} from './scenes/snack-bar/snack-bar-scene';
import {SortScene} from './scenes/sort/sort-scene';
import {StepperScene} from './scenes/stepper/stepper-scene';
import {TableScene} from './scenes/table/table-scene';
import {TabsScene} from './scenes/tabs/tabs-scene';
import {ToolbarScene} from './scenes/toolbar/toolbar-scene';
import {TooltipScene} from './scenes/tooltip/tooltip-scene';
import {TreeScene} from './scenes/tree/tree-scene';

let hue = 0;

type SceneViewerRoute = {
  path: string,
  component: ComponentType<SceneViewer>,
  data: {
    scene: ComponentType<unknown>,
    scale?: number,
    hueRotate?: number
  }
};

const routes: SceneViewerRoute[] = [
  {path: 'autocomplete', component: SceneViewer, data: {scene: AutocompleteScene}},
  {path: 'badge', component: SceneViewer, data: {scale: 1.5, scene: BadgeScene}},
  {path: 'bottom-sheet', component: SceneViewer, data: {scene: BottomSheetScene}},
  {path: 'button', component: SceneViewer, data: {scene: ButtonScene}},
  {path: 'button-toggle', component: SceneViewer, data: {scale: 1.5, scene: ButtonToggleScene}},
  {path: 'card', component: SceneViewer, data: {scene: CardScene}},
  {path: 'checkbox', component: SceneViewer, data: {scene: CheckboxScene}},
  {path: 'chips', component: SceneViewer, data: {scene: ChipsScene}},
  {path: 'core', component: SceneViewer, data: {scene: CoreScene}},
  {path: 'datepicker', component: SceneViewer, data: {scale: 0.8, scene: DatepickerScene}},
  {path: 'dialog', component: SceneViewer, data: {scene: DialogScene}},
  {path: 'divider', component: SceneViewer, data: {scale: 2, scene: DividerScene}},
  {path: 'expansion', component: SceneViewer, data: {scene: ExpansionScene}},
  {path: 'form-field', component: SceneViewer, data: {scene: FormFieldScene}},
  {path: 'grid-list', component: SceneViewer, data: {scene: GridListScene}},
  {path: 'icon', component: SceneViewer, data: {scale: 2.2, scene: IconScene}},
  {path: 'input', component: SceneViewer, data: {scene: InputScene}},
  {path: 'list', component: SceneViewer, data: {scene: ListScene}},
  {path: 'menu', component: SceneViewer, data: {scene: MenuScene}},
  {path: 'paginator', component: SceneViewer, data: {scale: 1.5, scene: PaginatorScene}},
  {path: 'progress-bar', component: SceneViewer, data: {scene: ProgressBarScene}},
  {
    path: 'progress-spinner',
    component: SceneViewer,
    data: {scale: 1.3, scene: ProgressSpinnerScene}
  },
  {path: 'radio', component: SceneViewer, data: {scene: RadioScene}},
  {path: 'ripple', component: SceneViewer, data: {scene: RipplesScene}},
  {path: 'select', component: SceneViewer, data: {scene: SelectScene}},
  {path: 'sidenav', component: SceneViewer, data: {scene: SidenavScene}},
  {path: 'slide-toggle', component: SceneViewer, data: {scene: SlideToggleScene}},
  {path: 'slider', component: SceneViewer, data: {scene: SliderScene}},
  {path: 'snack-bar', component: SceneViewer, data: {scene: SnackBarScene}},
  {path: 'sort', component: SceneViewer, data: {scene: SortScene}},
  {path: 'stepper', component: SceneViewer, data: {scene: StepperScene}},
  {path: 'table', component: SceneViewer, data: {scene: TableScene}},
  {path: 'tabs', component: SceneViewer, data: {scene: TabsScene}},
  {path: 'toolbar', component: SceneViewer, data: {scene: ToolbarScene}},
  {path: 'tooltip', component: SceneViewer, data: {scene: TooltipScene}},
  {path: 'tree', component: SceneViewer, data: {scene: TreeScene}},
].sort((a, b) => (a.path > b.path) ? 1 : ((b.path > a.path) ? -1 : 0))
  .map((route: SceneViewerRoute) => ({...route, data: {...route.data, hueRotate: 15 * hue++}}));

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
