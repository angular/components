import {
  Component,
  Directive,
  ViewChild,
  ViewContainerRef,
  provideZoneChangeDetection,
  signal,
  inject,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from './snack-bar';
import {MatSnackBarConfig} from './snack-bar-config';
import {MATERIAL_ANIMATIONS} from '../core';

describe('MatSnackBar Zone.js integration', () => {
  let snackBar: MatSnackBar;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection(),
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });

    snackBar = TestBed.inject(MatSnackBar);
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
  });

  it('should clear the dismiss timeout when dismissed before timeout expiration', async () => {
    let config = new MatSnackBarConfig();
    config.duration = 1000;
    snackBar.open('content', 'test', config);

    setTimeout(() => snackBar.dismiss(), 500);

    await wait(700);

    expect(viewContainerFixture.isStable()).toBe(true);
  });

  it('should clear the dismiss timeout when dismissed with action', async () => {
    let config = new MatSnackBarConfig();
    config.duration = 1000;
    const snackBarRef = snackBar.open('content', 'test', config);

    setTimeout(() => snackBarRef.dismissWithAction(), 500);

    await wait(700);
    viewContainerFixture.detectChanges();
    await wait(0);

    expect(viewContainerFixture.isStable()).toBe(true);
  });
});

@Directive({
  selector: 'dir-with-view-container',
})
class DirectiveWithViewContainer {
  viewContainerRef = inject(ViewContainerRef);
}

@Component({
  selector: 'arbitrary-component',
  template: `@if (childComponentExists()) {<dir-with-view-container></dir-with-view-container>}`,
  imports: [DirectiveWithViewContainer],
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer!: DirectiveWithViewContainer;

  childComponentExists = signal(true);

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}
