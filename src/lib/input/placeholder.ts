import {
  Component,
  ComponentRef,
  Directive,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OpaqueToken,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {PortalHost} from '../core';
import {ComponentPortal} from '../core/portal/portal';
import {coerceBooleanProperty} from '../core/coersion/boolean-property';


/**
 * A token to provide the host interface that MdPlaceholder will use to inject itself in
 * the View tree. If this token isn't on the host of the directive, an error will be thrown.
 * @type {OpaqueToken}
 */
export const MD_PLACEHOLDER_HOST  = new OpaqueToken('mdPlaceholderHost');

/**
 * Interface for components that want to host an MdPlaceholder directive.
 */
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

  constructor(@Inject(MD_PLACEHOLDER_HOST) public _host: MdPlaceholderHost,
              private _vcr: ViewContainerRef) {}

  ngOnInit() {
    const portal = new ComponentPortal(MdPlaceholderContent, this._vcr);
    const componentRef: ComponentRef<MdPlaceholderContent> =
      this._host.placeholderPortalHost.attach(portal);
    componentRef.instance.content = this.placeholder;
    componentRef.instance.placeholder = this;
  }
}
