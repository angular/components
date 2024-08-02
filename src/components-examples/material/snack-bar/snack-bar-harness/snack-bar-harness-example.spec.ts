import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {SnackBarHarnessExample} from './snack-bar-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarHarness} from '@angular/material/snack-bar/testing';

describe('SnackBarHarnessExample', () => {
  let fixture: ComponentFixture<SnackBarHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(SnackBarHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for simple snack-bar', async () => {
    const snackBarRef = fixture.componentInstance.open('Hi!', '');
    let snackBars = await loader.getAllHarnesses(MatSnackBarHarness);

    expect(snackBars.length).toBe(1);

    snackBarRef.dismiss();
    snackBars = await loader.getAllHarnesses(MatSnackBarHarness);
    expect(snackBars.length).toBe(0);
  });

  it('should be able to get message of simple snack-bar', async () => {
    fixture.componentInstance.open('Subscribed to newsletter.');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Subscribed to newsletter.');
  });

  it('should be able to get action description of simple snack-bar', async () => {
    fixture.componentInstance.open('Hello', 'Unsubscribe');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.getActionDescription()).toBe('Unsubscribe');
  });

  it('should be able to check whether simple snack-bar has action', async () => {
    fixture.componentInstance.open('With action', 'Unsubscribe');
    let snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(true);

    fixture.componentInstance.open('No action');
    snackBar = await loader.getHarness(MatSnackBarHarness);
    expect(await snackBar.hasAction()).toBe(false);
  });
});
