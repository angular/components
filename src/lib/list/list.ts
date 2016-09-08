import {
    Component,
    ViewEncapsulation,
    ContentChildren,
    ContentChild,
    QueryList,
    Directive,
    ElementRef,
    Renderer,
    AfterContentInit,
    NgModule,
    ModuleWithProviders,
} from '@angular/core';
import {MatLine, MatLineSetter, MatLineModule} from '@angular2-material/core';

@Directive({
  selector: 'mat-divider'
})
export class MatListDivider {}

@Component({
  moduleId: module.id,
  selector: 'mat-list, mat-nav-list',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None
})
export class MatList {}

/* Need directive for a ContentChild query in list-item */
@Directive({ selector: '[mat-list-avatar]' })
export class MatListAvatar {}

@Component({
  moduleId: module.id,
  selector: 'mat-list-item, a[mat-list-item]',
  host: {
    'role': 'listitem',
    '(focus)': '_handleFocus()',
    '(blur)': '_handleBlur()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None
})
export class MatListItem implements AfterContentInit {
  _hasFocus: boolean = false;

  private _lineSetter: MatLineSetter;

  @ContentChildren(MatLine) _lines: QueryList<MatLine>;

  @ContentChild(MatListAvatar)
  set _hasAvatar(avatar: MatListAvatar) {
    this._renderer.setElementClass(this._element.nativeElement, 'mat-list-avatar', avatar != null);
  }

  constructor(private _renderer: Renderer, private _element: ElementRef) {}

  /** TODO: internal */
  ngAfterContentInit() {
    this._lineSetter = new MatLineSetter(this._lines, this._renderer, this._element);
  }

  _handleFocus() {
    this._hasFocus = true;
  }

  _handleBlur() {
    this._hasFocus = false;
  }
}


@NgModule({
  imports: [MatLineModule],
  exports: [MatList, MatListItem, MatListDivider, MatListAvatar, MatLineModule],
  declarations: [MatList, MatListItem, MatListDivider, MatListAvatar],
})
export class MatListModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatListModule,
      providers: []
    };
  }
}
