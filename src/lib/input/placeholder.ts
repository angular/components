import {
  Directive,
  Inject,
  Input,
  OpaqueToken,
  TemplateRef, Component, ViewContainerRef, ComponentRef, HostBinding, ViewChild, HostListener,
  AfterContentInit, ReflectiveInjector, Injector,
} from '@angular/core';
import {PortalHost} from '../core';
import {ComponentPortal} from '../core/portal/portal';
import {coerceBooleanProperty} from '../core/coersion/boolean-property';


export const MD_PLACEHOLDER_HOST_TOKEN  = new OpaqueToken('mdPlaceholderHost');

export interface MdPlaceholderHost {
  placeholderPortalHost: PortalHost;
  readonly dividerColor: string;
  readonly empty: boolean;
}


@Component({
  moduleId: module.id,
  selector: '',
  templateUrl: 'placeholder.html',
  styleUrls: ['placeholder.css'],
})
export class MdPlaceholderContent {
  @ViewChild('stringTemplate') public _stringTemplate: TemplateRef<void>;
  public content: string | TemplateRef<void> = '';
  public placeholder: MdPlaceholder = null;

  _template(): TemplateRef<void> {
    if (typeof this.content == 'string') {
      return this._stringTemplate;
    } else if (this.content instanceof TemplateRef) {
      return this.content;
    } else {
      return null;
    }
  }
}


@Directive({
  selector: '[md-input][placeholder], [md-textarea][placeholder], [md-placeholder]:not(template)',
})
export class MdPlaceholder  {
  @Input('required') set required(v: boolean | null) {
    this._required = coerceBooleanProperty(v);
  }
  @Input('placeholder') placeholder: string | TemplateRef<void>;
  @Input('floatingPlaceholder') set floatingPlaceholder(v: boolean) {
    this._floatingPlaceholder = coerceBooleanProperty(v);
  }
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }

  get dividerColor() { return this._host.dividerColor; }
  get empty() { return this._host.empty; }

  @HostBinding('attr.placeholder') _attrPlaceholder: any = null;

  @HostListener('focus') _onFocus() { this._focused = true; }
  @HostListener('blur') _onBlur() { this._focused = false; }

  _focused: boolean = false;
  _required: boolean = false;
  _floatingPlaceholder: boolean = true;

  constructor(@Inject(MD_PLACEHOLDER_HOST_TOKEN) public _host: MdPlaceholderHost,
              private _vcr: ViewContainerRef) {}

  ngOnInit() {
    const portal = new ComponentPortal(MdPlaceholderContent, this._vcr);
    const componentRef: ComponentRef<MdPlaceholderContent> =
      this._host.placeholderPortalHost.attach(portal);
    componentRef.instance.content = this.placeholder;
    componentRef.instance.placeholder = this;
  }
}
