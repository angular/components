import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {DialogHarnessExample} from './dialog-harness-example';

describe('DialogHarnessExample', () => {
  let fixture: ComponentFixture<DialogHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}}],
    });
    fixture = TestBed.createComponent(DialogHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for dialog', async () => {
    fixture.componentInstance.open();
    const dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
  });

  it('should load harness for dialog with specific id', async () => {
    fixture.componentInstance.open({id: 'my-dialog'});
    fixture.componentInstance.open({id: 'other'});
    let dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(2);

    dialogs = await loader.getAllHarnesses(MatDialogHarness.with({selector: '#my-dialog'}));
    expect(dialogs.length).toBe(1);
  });

  it('should be able to get role of dialog', async () => {
    fixture.componentInstance.open({role: 'alertdialog'});
    fixture.componentInstance.open({role: 'dialog'});
    const dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(await dialogs[0].getRole()).toBe('alertdialog');
    expect(await dialogs[1].getRole()).toBe('dialog');
  });

  it('should be able to close dialog', async () => {
    fixture.componentInstance.open({disableClose: true});
    fixture.componentInstance.open();
    let dialogs = await loader.getAllHarnesses(MatDialogHarness);

    expect(dialogs.length).toBe(2);
    await dialogs[0].close();

    dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    // should be a noop since "disableClose" is set to "true".
    await dialogs[0].close();
    dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
  });
});
