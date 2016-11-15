import {
  Component,
  HostBinding,
  Input,
  ViewChild,
  ElementRef,
  OnInit,
  NgModule,
  ModuleWithProviders,
  ViewEncapsulation,
  HostListener,
  TemplateRef,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {
  ProjectionModule,
  DomProjection,
  DomProjectionHost,
  MdError,
  coerceBooleanProperty
} from '../core';
import {MdTextareaAutosize} from './autosize';


export class MdInputUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input.`);
  }
}


// Invalid input type. Using one of these will throw an MdInputUnsupportedTypeError.
const MD_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


/**
 * A component that can be attached to either an input or a textarea. This is the master
 */
@Component({
  moduleId: module.id,
  selector: 'input[md-input], textarea[md-textarea]',
  templateUrl: 'input.html',
  styleUrls: ['input.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    // This is to remove the properties of the `input md-input` itself. We still want to use them
    // as an @Input though, so we use HostBinding.
    'class': '',
    'style': '',
    'attr.align': ''
  }
})
export class MdInput implements OnInit {
  @ViewChild(DomProjectionHost) _host: DomProjectionHost;
  @ViewChild('suffix') _suffix: TemplateRef<any>;
  @ViewChild('prefix') _prefix: TemplateRef<any>;
  private _focused: boolean = false;

  @Input('class') _cssClass: string = '';
  @Input('style') _cssStyle: string = '';
  get _safeCssStyle(): SafeStyle {
    return this._dom.bypassSecurityTrustStyle(this._cssStyle || '');
  }
  @HostBinding('attr.class') get _attrClass(): any { return null; }
  @HostBinding('attr.style') get _attrStyle(): any { return null; }

  @Input('type') _type: string;

  constructor(private _dom: DomSanitizer, private _projection: DomProjection,
              private _ref: ElementRef) {}

  _suffixTemplate(): TemplateRef<any> {
    if (typeof this.mdSuffix == 'string') {
      return this._suffix;
    } else if (this.mdSuffix instanceof TemplateRef) {
      return this.mdSuffix;
    } else {
      return null;
    }
  }

  _prefixTemplate(): TemplateRef<any> {
    if (typeof this.mdPrefix == 'string') {
      return this._prefix;
    } else if (this.mdPrefix instanceof TemplateRef) {
      return this.mdPrefix;
    } else {
      return null;
    }
  }

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }
  private _disabled: boolean = false;

  get _value() { return this._ref.nativeElement.value; }
  get empty() {
    return (this._value == null || this._value === '')
        && this._ref.nativeElement.type !== 'date';
  }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }

  ngOnInit() {
    this._projection.project(this._ref, this._host);

    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this._type) != -1) {
      throw new MdInputUnsupportedTypeError(this._type);
    }
  }

  get focused() { return this._focused; }

  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() align: 'start' | 'end' = 'start';
  @Input() mdPrefix: string | TemplateRef<any>;
  @Input() mdSuffix: string | TemplateRef<any>;


  @HostListener('focus') _onFocus() {
    this._focused = true;
  }
  @HostListener('blur') _onBlur() {
    this._focused = false;
  }

  focus() {
    this._ref.nativeElement.focus();
  }
}


@NgModule({
  declarations: [MdPlaceholder, MdInput, MdHint, MdTextareaAutosize],
  imports: [CommonModule, FormsModule],
  exports: [MdPlaceholder, MdInput, MdHint, MdTextareaAutosize],
})
export class MdInputModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdInputModule,
      providers: []
    };
  }
}
