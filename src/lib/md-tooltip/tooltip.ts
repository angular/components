import {
  ApplicationRef,
  ComponentRef,
  Directive,
  DynamicComponentLoader,
  HostListener,
  Input,
  Provider,
  ReflectiveInjector,
  ViewContainerRef,
  NgModule
} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ViewContainerRef_ } from '@angular/core/src/linker/view_container_ref';
import { MdTooltipComponent } from './tooltip.component';
import { MdTooltipOptions } from './tooltip.options';

@Directive({
  selector: '[tooltip]'
})

export class MdTooltip {
  private visible: boolean = false;
  private timer: any;

  @Input('tooltip') content: string;
  @Input('tooltip-direction') direction: string = 'bottom';
  @Input('tooltip-delay') delay: number = 0;

  private viewContainerRef: ViewContainerRef;
  private loader: DynamicComponentLoader;

  private tooltip: Promise<ComponentRef<any>>;

  private appRef: any;

  constructor(viewContainerRef: ViewContainerRef, loader: DynamicComponentLoader, appRef: ApplicationRef) {
    this.viewContainerRef = viewContainerRef;
    this.loader = loader;
    this.appRef = appRef;
  }

  /**
   * show tooltip while mouse enter or focus of element
   * @param event
   */
  @HostListener('focusin', ['$event'])
  @HostListener('mouseenter', ['$event'])
  public show(event: Event): void {
    if (this.visible) {
      return;
    }
    this.visible = true;
    let options = new MdTooltipOptions({
      content: this.content,
      direction: this.direction,
      hostEl: this.viewContainerRef.element
    });

    let binding = ReflectiveInjector.resolve([
      new Provider(MdTooltipOptions, { useValue: options })
    ]);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = 0;
      let appElement: ViewContainerRef = new ViewContainerRef_(this.appRef['_rootComponents'][0]._hostElement);
      this.tooltip = this.loader
        .loadNextToLocation(MdTooltipComponent, appElement, binding)
        .then((componentRef: ComponentRef<any>) => {
          return componentRef;
        });
    }, this.delay);
  }

  /**
   * hide tooltip while mouse our/leave or blur of element
   * @param event
   */
  @HostListener('focusout', ['$event'])
  @HostListener('mouseleave', ['$event'])
  public hide(event: Event): void {
    clearTimeout(this.timer);
    if (!this.visible) {
      return;
    }
    this.visible = false;
    if (this.tooltip) {
      this.tooltip.then((componentRef: ComponentRef<any>) => {
        componentRef.destroy();
        return componentRef;
      });
    }
  }
}

export const MD_TOOLTIP_DIRECTIVES: any[] = [MdTooltip, MdTooltipComponent];

@NgModule({
  imports: [CommonModule],
  exports: MD_TOOLTIP_DIRECTIVES,
  declarations: MD_TOOLTIP_DIRECTIVES
})
export class MdTooltipModule { }