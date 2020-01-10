/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, ComponentType, PortalInjector, TemplatePortal} from '@angular/cdk/portal';
import {ComponentFactoryResolver, ComponentRef, Injectable, InjectionToken, Renderer2, RendererFactory2, TemplateRef} from '@angular/core';

import {FeatureHighlightConfig} from './feature-highlight-config';
import {FeatureHighlightContainer} from './feature-highlight-container';
import {FeatureHighlightOverlay} from './feature-highlight-overlay';
import {FeatureHighlightRef, FeatureHighlightRefBase} from './feature-highlight-ref';

/**
 * Injection token that can be used to access the data passed into a feature
 * highlight.
 */
export const FEATURE_HIGHLIGHT_DATA =
    new InjectionToken<unknown>('FeatureHighlightData');

/** Service for implementing feature highlight. */
@Injectable({providedIn: 'root'})
export class FeatureHighlight implements FeatureHighlightBase {
  private readonly renderer: Renderer2;
  private featureHighlightRef?: FeatureHighlightRef;

  constructor(
      private readonly componentFactoryResolver: ComponentFactoryResolver,
      private readonly overlay: FeatureHighlightOverlay,
      private readonly directionality: Directionality,
      readonly rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Open a feature highlight with callout as a component.
   *
   * @param callout a component for the callout. Make sure that the component
   * is added as an entry component in your module.
   * @param config config values for feature highlight.
   * @return a reference to the feature highlight which has access to callout
   * instance and feature highlight component APIs.
   */
  open<C = unknown, D = unknown>(
      callout: ComponentType<C>,
      config: FeatureHighlightConfig<D>): FeatureHighlightRef<C>;

  /**
   * Open a feature highlight with callout as a template ref.
   *
   * @param callout a template ref for the callout.
   * @param config config values for feature highlight.
   * @return a reference to the feature highlight which has access to callout
   * instance and feature highlight component APIs.
   */
  open<D = unknown>(
      callout: TemplateRef<{}>,
      config: FeatureHighlightConfig<D>): FeatureHighlightRef<{}>;

  open<C = unknown, D = unknown>(
      callout: ComponentType<C>|TemplateRef<{}>,
      config: FeatureHighlightConfig<D>):
      FeatureHighlightRef<C>|FeatureHighlightRef<{}> {
    config = {...new FeatureHighlightConfig(), ...config};

    let overlayRef: OverlayRef|undefined = undefined;
    if (!config.isOuterCircleBounded) {
      overlayRef = this.createOverlay(config);
    }

    const container = this.attachFeatureHighlightContainer(config, overlayRef);
    const featureHighlightRef =
        this.attachContent(callout, container, overlayRef, config);
    this.featureHighlightRef = featureHighlightRef;

    featureHighlightRef.afterAccepted().subscribe(() => {
      this.removeOverlayContainer(config);
    });
    featureHighlightRef.afterDismissed().subscribe(() => {
      this.removeOverlayContainer(config);
    });

    return featureHighlightRef;
  }

  /** Return the current reference of feature highlight. */
  getFeatureHighlightRef(): FeatureHighlightRef|undefined {
    return this.featureHighlightRef;
  }

  /** Return an overlay reference when the outer circle is unbounded. */
  private createOverlay<D>(config: FeatureHighlightConfig<D>): OverlayRef {
    // The position strategy ensures that the top left corner of the overlay
    // is located at the same position of the top left corner of the target
    // element.
    const positionStrategy =
        this.overlay.position()
            .flexibleConnectedTo(config.targetViewContainerRef.element)
            .withPositions([
              {
                originX: 'start',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'center',
              },
            ]);
    const overlayConfig = new OverlayConfig({
      positionStrategy,
      direction: this.directionality,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      disposeOnNavigation: true,
    });

    // Create the overlay container div that hosts feature highlight container,
    // and insert it into the DOM as a sibling of the target element.
    const overlayContainerElement = document.createElement('div');
    overlayContainerElement.classList.add('cdk-overlay-container');
    this.overlay.setContainerElement(overlayContainerElement);

    const targetParent = this.getTargetParent(config);
    this.renderer.appendChild(targetParent, overlayContainerElement);

    return this.overlay.create(overlayConfig);
  }

  /** Attach a feature highlight container to the DOM.  */
  private attachFeatureHighlightContainer<D>(
      config: FeatureHighlightConfig<D>,
      overlayRef?: OverlayRef): FeatureHighlightContainer {
    let containerRef: ComponentRef<FeatureHighlightContainer>;

    const injector = this.createInjector(config, [
      [FeatureHighlightConfig, config],
    ]);

    // If the outer circle is bounded, feature highlight container is created
    // as a sibling element of the target, otherwise the container is attached
    // to the overlay.
    if (config.isOuterCircleBounded) {
      containerRef = config.targetViewContainerRef.createComponent(
          this.componentFactoryResolver.resolveComponentFactory(
              FeatureHighlightContainer),
          undefined, injector);
    } else {
      const containerPortal = new ComponentPortal(
          FeatureHighlightContainer, config.targetViewContainerRef, injector);
      containerRef =
          overlayRef!.attach<FeatureHighlightContainer>(containerPortal);
    }

    containerRef.instance.afterAccepted.subscribe(() => {
      containerRef.destroy();
    });
    containerRef.instance.afterDismissed.subscribe(() => {
      containerRef.destroy();
    });

    return containerRef.instance;
  }

  /**
   * Create a reference of feature highlight and attach callout to the
   * feature highlight component.
   */
  private attachContent<C, D>(
      callout: ComponentType<C>|TemplateRef<{}>,
      container: FeatureHighlightContainer,
      overlayRef: OverlayRef|undefined,
      config: FeatureHighlightConfig<D>,
      ): FeatureHighlightRef<C|{}> {
    const featureHighlightRef =
        new FeatureHighlightRef<C|{}>(container, overlayRef);

    if (callout instanceof TemplateRef) {
      const portal = new TemplatePortal<{}>(
          callout,
          /* viewContainerRef= */ null!,
          {
            $implicit: config.data,
            featureHighlightRef,
          },
      );
      featureHighlightRef.calloutInstance =
          container.attachCalloutTemplatePortal(portal).context;
    } else {
      const injector = this.createInjector(config, [
        [FeatureHighlightConfig, config],
        [FEATURE_HIGHLIGHT_DATA, config.data],
        [FeatureHighlightRef, featureHighlightRef],
      ]);
      const portal = new ComponentPortal(
          callout, /* viewContainerRef= */ undefined, injector);
      featureHighlightRef.calloutInstance =
          container.attachCalloutComponentPortal(portal).instance;
    }

    return featureHighlightRef;
  }

  /** Clean up the overlay container element created, if exists. */
  private removeOverlayContainer<D>(config: FeatureHighlightConfig<D>) {
    if (!config.isOuterCircleBounded) {
      const targetParent = this.getTargetParent(config);
      this.renderer.removeChild(
          targetParent, this.overlay.getContainerElement());
    }
  }

  private createInjector<D>(
      config: FeatureHighlightConfig<D>,
      dependencies: Array<[{}, unknown]>): PortalInjector {
    const targetInjector = config.targetViewContainerRef.injector;

    return new PortalInjector(
        targetInjector, new WeakMap<{}, unknown>(dependencies));
  }

  private getTargetParent<D>(config: FeatureHighlightConfig<D>) {
    return this.renderer.parentNode(
        config.targetViewContainerRef.element.nativeElement);
  }
}

/** Base interface of defining a feature highlight service. */
export interface FeatureHighlightBase {
  /**
   * Open a feature highlight with callout as a template ref.
   *
   * @param callout a template ref for the callout.
   * @param config config values for feature highlight.
   * @return a reference to the feature highlight which has access to APIs
   * for manipulating feature highlight component.
   */
  open<C = unknown, D = unknown>(
      callout: ComponentType<C>,
      config: FeatureHighlightConfig<D>): FeatureHighlightRefBase;

  /**
   * Open a feature highlight with callout as a template ref.
   *
   * @param callout a template ref for the callout.
   * @param config config values for feature highlight.
   * @return a reference to the feature highlight which has access to APIs
   * for manipulating feature highlight component.
   */
  open<D = unknown>(
      callout: TemplateRef<{}>,
      config: FeatureHighlightConfig<D>): FeatureHighlightRefBase;

  /** Return the current reference of feature highlight. */
  getFeatureHighlightRef(): FeatureHighlightRefBase|undefined;
}
