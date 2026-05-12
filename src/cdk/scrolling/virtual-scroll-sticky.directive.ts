import {AfterViewInit, Directive, ElementRef, inject, OnDestroy} from '@angular/core';

/**
 * Fixes `position: sticky` for descendants of a `cdk-virtual-scroll-viewport`.
 * This directive intercepts every `style` attribute mutation that CDK makes on the wrapper
 * and converts `transform: translateY(Xpx)` to `top: Xpx`.
 *
 * Apply this directive to the `cdk-virtual-scroll-viewport` element.
 */
@Directive({
  selector: 'cdk-virtual-scroll-viewport[cdkVirtualScrollSticky]',
})
export class CdkVirtualScrollSticky implements AfterViewInit, OnDestroy {
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  private _wrapperStyleObserver: MutationObserver | null = null;

  ngAfterViewInit() {
    const wrapper = this._elementRef.nativeElement.querySelector(
      '.cdk-virtual-scroll-content-wrapper',
    ) as HTMLElement | null;

    if (!wrapper) {
      return;
    }

    this._applyTransformFix(wrapper);

    this._wrapperStyleObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style' &&
          (mutation.target as HTMLElement).style.transform !== 'none'
        ) {
          this._applyTransformFix(mutation.target as HTMLElement);
        }
      }
    });

    this._wrapperStyleObserver.observe(wrapper, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }

  ngOnDestroy() {
    this._wrapperStyleObserver?.disconnect();
    this._wrapperStyleObserver = null;
  }

  /**
   * Converts `transform: translateY(Xpx)` to `top: Xpx` on the given element.
   * Using `top` instead of `transform` avoids creating a new stacking context,
   * which would otherwise break `position: sticky` on descendant elements.
   */
  private _applyTransformFix(el: HTMLElement) {
    const transform = el.style.transform;
    if (!transform || transform === 'none') {
      return;
    }

    const match = transform.match(/translateY\(([-\d.]+)px\)/);
    if (!match) {
      return;
    }

    const translateY = parseFloat(match[1]);
    el.style.transform = 'none';
    el.style.top = `${translateY}px`;
  }
}
