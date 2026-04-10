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
import {MenuItem} from '../menu-item';
import {MenuTrigger} from '../menu-trigger';
import {MenuItemHarness, MenuTriggerHarness} from './menu-harness';

describe('Aria Menu Harness', () => {
  let fixture: any;
  let loader: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Menu, MenuItem, MenuTrigger, MenuTestApp],
    });

    fixture = TestBed.createComponent(MenuTestApp);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should locate the menu trigger harness', async () => {
    const trigger = await loader.getHarness(MenuTriggerHarness.with({text: 'Open Menu'}));
    expect(trigger).toBeTruthy();
    expect(await trigger.getText()).toBe('Open Menu');
  });

  it('should open the menu and locate items', async () => {
    const trigger = await loader.getHarness(MenuTriggerHarness);
    await trigger.click();
    fixture.detectChanges();

    const menu = await trigger.getMenu();
    expect(menu).toBeTruthy();

    const items = await menu.getItems();
    expect(items.length).toBe(4);
    expect(await items[0].getText()).toBe('Item 1');
    expect(await items[1].getText()).toBe('Item 2');
    expect(await items[2].getText()).toBe('Submenu');
    expect(await items[3].getText()).toBe('Nested Item');
  });

  it('should filter menu items by state', async () => {
    const trigger = await loader.getHarness(MenuTriggerHarness);
    await trigger.click();
    fixture.detectChanges();

    const disabledItems = await loader.getAllHarnesses(MenuItemHarness.with({disabled: true}));
    expect(disabledItems.length).toBe(1);
    expect(await disabledItems[0].getText()).toBe('Item 2');
  });

  it('should locate and open a nested submenu', async () => {
    const mainTrigger = await loader.getHarness(MenuTriggerHarness.with({text: 'Open Menu'}));
    await mainTrigger.click();
    fixture.detectChanges();

    const subItem = await loader.getHarness(MenuItemHarness.with({text: 'Submenu'}));
    expect(await subItem.hasSubmenu()).toBe(true);
    await subItem.click();
    fixture.detectChanges();

    const submenu = await subItem.getSubmenu();
    expect(submenu).toBeTruthy();
    const subItems = await submenu!.getItems();
    expect(subItems.length).toBe(1);
    expect(await subItems[0].getText()).toBe('Nested Item');
  });
});

@Component({
  template: `
    <button ngMenuTrigger [menu]="testMenu">Open Menu</button>

    <div ngMenu #testMenu="ngMenu">
      <div ngMenuItem value="Item 1">Item 1</div>
      <div ngMenuItem value="Item 2" [disabled]="true">Item 2</div>
      <div ngMenuItem value="Submenu" [submenu]="nestedMenu">Submenu</div>

      <div ngMenu #nestedMenu="ngMenu">
        <div ngMenuItem value="Nested Item">Nested Item</div>
      </div>
    </div>
  `,
  imports: [Menu, MenuItem, MenuTrigger],
})
class MenuTestApp {}
