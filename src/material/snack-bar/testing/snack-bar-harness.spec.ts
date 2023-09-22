import {Component, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarHarness} from './snack-bar-harness';

describe('MatSnackBarHarness', () => {
  let fixture: ComponentFixture<SnackbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      declarations: [SnackbarHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for simple snack-bar', async () => {
    const snackBarRef = fixture.componentInstance.openSimple('Hello!', '');
    let snackBars = await loader.getAllHarnesses(MatSnackBarHarness);

    expect(snackBars.length).toBe(1);

    snackBarRef.dismiss();
    snackBars = await loader.getAllHarnesses(MatSnackBarHarness);
    expect(snackBars.length).toBe(0);
  });

  it('should load harness for custom snack-bar', async () => {
    const snackBarRef = fixture.componentInstance.openCustom();
    let snackBars = await loader.getAllHarnesses(MatSnackBarHarness);

    expect(snackBars.length).toBe(1);

    snackBarRef.dismiss();
    snackBars = await loader.getAllHarnesses(MatSnackBarHarness);
    expect(snackBars.length).toBe(0);
  });

  it('should load snack-bar harness by selector', async () => {
    fixture.componentInstance.openSimple('Hello!', '', {panelClass: 'my-snack-bar'});
    const snackBars = await loader.getAllHarnesses(
      MatSnackBarHarness.with({
        selector: '.my-snack-bar',
      }),
    );
    expect(snackBars.length).toBe(1);
  });

  it('should be able to get role of snack-bar', async () => {
    // Get role is now deprecated, so it should always return null.
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getRole()).toBe(null);

    fixture.componentInstance.openCustom({politeness: 'polite'});
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getRole()).toBe(null);

    fixture.componentInstance.openCustom({politeness: 'off'});
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getRole()).toBe(null);
  });

  it('should be able to get aria-live of snack-bar', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('assertive');

    fixture.componentInstance.openCustom({politeness: 'polite'});
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('polite');

    fixture.componentInstance.openCustom({politeness: 'off'});
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getAriaLive()).toBe('off');
  });

  it('should be able to get message of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Subscribed to newsletter.');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Subscribed to newsletter.');
  });

  it('should be able to get action description of simple snack-bar', async () => {
    fixture.componentInstance.openSimple('Hello', 'Unsubscribe');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Unsubscribe');
  });

  it('should be able to check whether simple snack-bar has action', async () => {
    fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);
  });

  it('should be able to dismiss simple snack-bar with action', async () => {
    const snackBarRef = fixture.componentInstance.openSimple('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    let actionCount = 0;
    snackBarRef.onAction().subscribe(() => actionCount++);

    expect(await snackBar.isDismissed())
      .withContext('The snackbar should be present in the DOM before dismiss')
      .toBe(false);

    await snackBar.dismissWithAction();
    expect(actionCount).toBe(1);
    expect(await snackBar.isDismissed())
      .withContext('The snackbar should be absent from the DOM after dismiss')
      .toBe(true);

    fixture.componentInstance.openSimple('No action');
    snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.dismissWithAction()).toBeRejectedWithError(/without an action/);
  });

  it('should be able to get message of a snack-bar with custom content', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('My custom snack-bar.');

    fixture.componentInstance.openCustomWithAction();
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('My custom snack-bar with action.');
  });

  it('should fail to get action description of a snack-bar with no action', async () => {
    fixture.componentInstance.openCustom();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    await expectAsync(snackBar.getActionDescription()).toBeRejectedWithError(/without an action/);
  });

  it('should be able to get action description of a snack-bar with an action', async () => {
    fixture.componentInstance.openCustomWithAction();
    const snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Ok');
  });

  it('should be able to check whether a snack-bar with custom content has an action', async () => {
    fixture.componentInstance.openCustom();
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);

    fixture.componentInstance.openCustomWithAction();
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);
  });
});

@Component({
  template: `
    <ng-template #custom>My custom snack-bar.</ng-template>
    <ng-template #customWithAction>
      <span matSnackBarLabel>My custom snack-bar with action.</span>
      <div matSnackBarActions><button matSnackBarAction>Ok</button></div>
    </ng-template>
  `,
})
class SnackbarHarnessTest {
  @ViewChild('custom') customTmpl: TemplateRef<any>;
  @ViewChild('customWithAction') customWithActionTmpl: TemplateRef<any>;

  constructor(public snackBar: MatSnackBar) {}

  openSimple(message: string, action = '', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, config);
  }

  openCustom(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customTmpl, config);
  }

  openCustomWithAction(config?: MatSnackBarConfig) {
    return this.snackBar.openFromTemplate(this.customWithActionTmpl, config);
  }
}
