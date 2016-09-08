import {
  NgModule,
  ModuleWithProviders,
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  Directive
} from '@angular/core';
import {Renderer} from '@angular/core';
import {ElementRef} from '@angular/core';

@Directive({
  selector: 'mat-toolbar-row'
})
export class MatToolbarRow {}

@Component({
  moduleId: module.id,
  selector: 'mat-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MatToolbar {

  private _color: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  @Input()
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  private _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  private _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this.renderer.setElementClass(this.elementRef.nativeElement, `mat-${color}`, isAdd);
    }
  }

}


@NgModule({
  exports: [MatToolbar, MatToolbarRow],
  declarations: [MatToolbar, MatToolbarRow],
})
export class MatToolbarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatToolbarModule,
      providers: []
    };
  }
}
