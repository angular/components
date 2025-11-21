import {waitForAsync, TestBed} from '@angular/core/testing';
import {Component, Injector, ViewChild, ViewContainerRef, inject} from '@angular/core';
import {CdkPortal} from '../portal';
import {createOverlayRef, OverlayContainer} from './index';

describe('OverlayContainer', () => {
  let overlayContainer: OverlayContainer;

  beforeEach(waitForAsync(() => {
    overlayContainer = TestBed.inject(OverlayContainer);
  }));

  it('should remove the overlay container element from the DOM on destruction', () => {
    const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    const overlayRef = createOverlayRef(TestBed.inject(Injector));
    overlayRef.attach(fixture.componentInstance.templatePortal);
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-container'))
      .not.withContext('Expected the overlay container to be in the DOM after opening an overlay')
      .toBeNull();

    // Manually call `ngOnDestroy` because there is no way to force Angular to destroy an
    // injectable in a unit test.
    overlayContainer.ngOnDestroy();

    expect(document.querySelector('.cdk-overlay-container'))
      .withContext('Expected the overlay container *not* to be in the DOM after destruction')
      .toBeNull();
  });

  it('should add and remove css classes from the container element', () => {
    overlayContainer.getContainerElement().classList.add('commander-shepard');

    const containerElement = document.querySelector('.cdk-overlay-container')!;
    expect(containerElement.classList.contains('commander-shepard'))
      .withContext('Expected the overlay container to have class "commander-shepard"')
      .toBe(true);

    overlayContainer.getContainerElement().classList.remove('commander-shepard');

    expect(containerElement.classList.contains('commander-shepard'))
      .withContext('Expected the overlay container not to have class "commander-shepard"')
      .toBe(false);
  });

  it('should remove overlay containers from the server when on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'server');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);
    extraContainer.remove();
  });

  it('should remove overlay containers from other unit tests', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    extraContainer.setAttribute('platform', 'test');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();
    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(1);
    extraContainer.remove();
  });

  it('should not remove extra containers that were created on the browser', () => {
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-overlay-container');
    document.body.appendChild(extraContainer);

    overlayContainer.getContainerElement();

    expect(document.querySelectorAll('.cdk-overlay-container').length).toBe(2);
    extraContainer.remove();
  });
});

/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
  template: `<ng-template cdkPortal>Cake</ng-template>`,
  imports: [CdkPortal],
})
class TestComponentWithTemplatePortals {
  viewContainerRef = inject(ViewContainerRef);

  @ViewChild(CdkPortal) templatePortal: CdkPortal;
}
