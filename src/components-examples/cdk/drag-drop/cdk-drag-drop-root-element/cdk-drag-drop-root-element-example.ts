import {
  Component,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ViewContainerRef,
  OnDestroy,
  inject,
  Injector,
} from '@angular/core';
import {createGlobalPositionStrategy, createOverlayRef, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Drag&Drop with alternate root element
 */
@Component({
  selector: 'cdk-drag-drop-root-element-example',
  templateUrl: 'cdk-drag-drop-root-element-example.html',
  styleUrl: 'cdk-drag-drop-root-element-example.css',
  imports: [CdkDrag],
})
export class CdkDragDropRootElementExample implements AfterViewInit, OnDestroy {
  private _injector = inject(Injector);
  private _viewContainerRef = inject(ViewContainerRef);

  @ViewChild(TemplateRef) _dialogTemplate: TemplateRef<any>;
  private _overlayRef: OverlayRef;
  private _portal: TemplatePortal;

  ngAfterViewInit() {
    this._portal = new TemplatePortal(this._dialogTemplate, this._viewContainerRef);
    this._overlayRef = createOverlayRef(this._injector, {
      positionStrategy: createGlobalPositionStrategy(this._injector)
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.backdropClick().subscribe(() => this._overlayRef.detach());
  }

  ngOnDestroy() {
    this._overlayRef.dispose();
  }

  openDialog() {
    this._overlayRef.attach(this._portal);
  }
}
