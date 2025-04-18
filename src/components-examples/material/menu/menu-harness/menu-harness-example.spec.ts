import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatMenuHarness} from '@angular/material/menu/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';
import {MenuHarnessExample} from './menu-harness-example';

describe('MenuHarnessExample', () => {
  let fixture: ComponentFixture<MenuHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}}],
    });
    fixture = TestBed.createComponent(MenuHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all menu harnesses', async () => {
    const menues = await loader.getAllHarnesses(MatMenuHarness);
    expect(menues.length).toBe(2);
  });

  it('should get disabled state', async () => {
    const [enabledMenu, disabledMenu] = await loader.getAllHarnesses(MatMenuHarness);
    expect(await enabledMenu.isDisabled()).toBe(false);
    expect(await disabledMenu.isDisabled()).toBe(true);
  });

  it('should get menu text', async () => {
    const [firstMenu, secondMenu] = await loader.getAllHarnesses(MatMenuHarness);
    expect(await firstMenu.getTriggerText()).toBe('Settings');
    expect(await secondMenu.getTriggerText()).toBe('Disabled menu');
  });

  it('should open and close', async () => {
    const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
    expect(await menu.isOpen()).toBe(false);
    await menu.open();
    expect(await menu.isOpen()).toBe(true);
    await menu.close();
    expect(await menu.isOpen()).toBe(false);
  });

  it('should get all items', async () => {
    const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
    await menu.open();
    expect((await menu.getItems()).length).toBe(2);
  });
});
