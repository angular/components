/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Menu} from '../menu';
import {MenuContent} from '../menu-content';
import {MenuItem} from '../menu-item';
import {MenuTrigger} from '../menu-trigger';
import {MenuBar} from '../menu-bar';
import {MenuItemHarness, MenuHarness} from './menu-harness';

describe('Aria Menu Harness', () => {
  let fixture: any;
  let loader: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Menu, MenuItem, MenuTrigger, MenuBar, MenuContent, MenuTestApp],
    });

    fixture = TestBed.createComponent(MenuTestApp);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should locate the menu harness', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    expect(menu).toBeTruthy();
  });

  it('should verify that the menu is initially closed', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    expect(await menu.isOpen()).toBe(false);
  });

  it('should open the menu', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();
    fixture.detectChanges();

    expect(await menu.isOpen()).toBe(true);
  });

  it('should close the menu', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();
    fixture.detectChanges();

    await menu.close();
    fixture.detectChanges();
    expect(await menu.isOpen()).toBe(false);
  });

  it('should get all items inside an open menu', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();
    fixture.detectChanges();

    const items = await menu.getItems();
    expect(items.length).toBe(3);
    expect(await items[0].getText()).toBe('Item 1');
  });

  it('should filter menu items by their disabled state', async () => {
    const menu = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await menu.open();
    fixture.detectChanges();

    const disabledItems = await loader.getAllHarnesses(MenuItemHarness.with({disabled: true}));
    expect(disabledItems.length).toBe(1);
    expect(await disabledItems[0].getText()).toBe('Item 2');
  });

  it('should locate and interact with nested submenus', async () => {
    const main = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await main.open();
    fixture.detectChanges();

    const subItem = await loader.getHarness(MenuItemHarness.with({text: 'Submenu'}));
    await subItem.click();
    fixture.detectChanges();

    const submenu = await subItem.getSubmenu();
    expect(submenu).toBeTruthy();
    expect(await submenu!.isOpen()).toBe(true);
  });

  it('should read items within a nested submenu', async () => {
    const main = await loader.getHarness(MenuHarness.with({triggerText: 'Open Menu'}));
    await main.open();
    fixture.detectChanges();

    const subItem = await loader.getHarness(MenuItemHarness.with({text: 'Submenu'}));
    await subItem.click();
    fixture.detectChanges();

    const submenu = await subItem.getSubmenu();
    const subItems = await submenu!.getItems();
    expect(subItems.length).toBe(1);
    expect(await subItems[0].getText()).toBe('Nested Item');
  });

  it('should confirm persistent horizontal menu bars are always open', async () => {
    const menubar = await loader.getHarness(MenuHarness.with({selector: '[ngMenuBar]'}));
    expect(menubar).toBeTruthy();
    expect(await menubar.isOpen()).toBe(true);
  });

  it('should read items from a persistent horizontal menu bar', async () => {
    const menubar = await loader.getHarness(MenuHarness.with({selector: '[ngMenuBar]'}));
    const items = await menubar.getItems();

    expect(items.length).toBe(2);
    expect(await items[0].getText()).toBe('File');
    expect(await items[1].getText()).toBe('Edit');
  });
});

@Component({
  template: `
    <button ngMenuTrigger [menu]="testMenu">Open Menu</button>

    <div ngMenu #testMenu="ngMenu">
      <ng-template ngMenuContent>
        <div ngMenuItem value="Item 1">Item 1</div>
        <div ngMenuItem value="Item 2" [disabled]="true">Item 2</div>
        <div ngMenuItem value="Submenu" [submenu]="nestedMenu">Submenu</div>
      </ng-template>
    </div>

    <div ngMenu #nestedMenu="ngMenu">
      <ng-template ngMenuContent>
        <div ngMenuItem value="Nested Item">Nested Item</div>
      </ng-template>
    </div>

    <div ngMenuBar>
      <div ngMenuItem value="File">File</div>
      <div ngMenuItem value="Edit">Edit</div>
    </div>
  `,
  imports: [Menu, MenuItem, MenuTrigger, MenuBar, MenuContent],
})
class MenuTestApp {}
