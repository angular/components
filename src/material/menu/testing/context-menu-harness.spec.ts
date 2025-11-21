import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatMenuModule} from '../menu-module';
import {MatContextMenuHarness} from './context-menu-harness';

describe('MatContextMenuHarness', () => {
  let fixture: ComponentFixture<MenuHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all context menu harnesses', async () => {
    const menues = await loader.getAllHarnesses(MatContextMenuHarness);
    expect(menues.length).toBe(1);
  });

  it('should open and close', async () => {
    const menu = await loader.getHarness(MatContextMenuHarness);
    expect(await menu.isOpen()).toBe(false);
    await menu.open();
    expect(await menu.isOpen()).toBe(true);
    await menu.open();
    expect(await menu.isOpen()).toBe(true);
    await menu.close();
    expect(await menu.isOpen()).toBe(false);
    await menu.close();
    expect(await menu.isOpen()).toBe(false);
  });

  it('should get all items', async () => {
    const menu = await loader.getHarness(MatContextMenuHarness);
    await menu.open();
    expect((await menu.getItems()).length).toBe(3);
  });

  it('should get filtered items', async () => {
    const menu = await loader.getHarness(MatContextMenuHarness);
    await menu.open();
    const items = await menu.getItems({text: 'Copy'});
    expect(items.length).toBe(1);
    expect(await items[0].getText()).toBe('Copy');
  });

  it('should get whether the trigger is disabled', async () => {
    const menu = await loader.getHarness(MatContextMenuHarness);
    expect(await menu.isDisabled()).toBe(false);
    fixture.componentInstance.disabled.set(true);
    expect(await menu.isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <div
      class="area"
      [matContextMenuTriggerFor]="contextMenu"
      [matContextMenuTriggerDisabled]="disabled()"></div>

    <mat-menu #contextMenu>
      <menu mat-menu-item>Cut</menu>
      <menu mat-menu-item>Copy</menu>
      <menu mat-menu-item>Paste</menu>
    </mat-menu>
  `,
  imports: [MatMenuModule],
  styles: `
    .area {
      width: 100px;
      height: 100px;
      outline: solid 1px;
    }
  `,
})
class MenuHarnessTest {
  disabled = signal(false);
}
