import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ElementRef,
  inject,
} from '@angular/core';
import {
  ComponentPortal,
  DomPortal,
  Portal,
  TemplatePortal,
  PortalModule,
} from '@angular/cdk/portal';

/**
 * @title Portal overview
 */
@Component({
  selector: 'cdk-portal-overview-example',
  templateUrl: 'cdk-portal-overview-example.html',
  styleUrl: 'cdk-portal-overview-example.css',
  imports: [PortalModule],
})
export class CdkPortalOverviewExample implements AfterViewInit {
  private _viewContainerRef = inject(ViewContainerRef);

  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<unknown>;
  @ViewChild('domPortalContent') domPortalContent: ElementRef<HTMLElement>;

  selectedPortal: Portal<any>;
  componentPortal: ComponentPortal<ComponentPortalExample>;
  templatePortal: TemplatePortal<any>;
  domPortal: DomPortal<any>;

  ngAfterViewInit() {
    this.componentPortal = new ComponentPortal(ComponentPortalExample);
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
    this.domPortal = new DomPortal(this.domPortalContent);
  }
}

@Component({
  selector: 'component-portal-example',
  template: 'Hello, this is a component portal',
})
export class ComponentPortalExample {}
