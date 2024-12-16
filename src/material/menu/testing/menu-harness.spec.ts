import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatMenuModule} from '@angular/material/menu';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatMenuHarness} from './menu-harness';

describe('MatMenuHarness', () => {
  describe('single-level menu', () => {
    let fixture: ComponentFixture<MenuHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [MatMenuModule, NoopAnimationsModule, MenuHarnessTest],
      });

      fixture = TestBed.createComponent(MenuHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should load all menu harnesses', async () => {
      const menues = await loader.getAllHarnesses(MatMenuHarness);
      expect(menues.length).toBe(2);
    });

    it('should load menu with exact text', async () => {
      const menus = await loader.getAllHarnesses(MatMenuHarness.with({triggerText: 'Settings'}));
      expect(menus.length).toBe(1);
      expect(await menus[0].getTriggerText()).toBe('Settings');
    });

    it('should load menu with regex label match', async () => {
      const menus = await loader.getAllHarnesses(MatMenuHarness.with({triggerText: /settings/i}));
      expect(menus.length).toBe(1);
      expect(await menus[0].getTriggerText()).toBe('Settings');
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

    it('should focus and blur a menu', async () => {
      const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
      expect(await menu.isFocused()).toBe(false);
      await menu.focus();
      expect(await menu.isFocused()).toBe(true);
      await menu.blur();
      expect(await menu.isFocused()).toBe(false);
    });

    it('should open and close', async () => {
      const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
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
      const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
      await menu.open();
      expect((await menu.getItems()).length).toBe(2);
    });

    it('should get filtered items', async () => {
      const menu = await loader.getHarness(MatMenuHarness.with({triggerText: 'Settings'}));
      await menu.open();
      const items = await menu.getItems({text: 'Account'});
      expect(items.length).toBe(1);
      expect(await items[0].getText()).toBe('Account');
    });
  });

  describe('multi-level menu', () => {
    let fixture: ComponentFixture<NestedMenuHarnessTest>;
    let loader: HarnessLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [MatMenuModule, NoopAnimationsModule, NestedMenuHarnessTest],
      });

      fixture = TestBed.createComponent(NestedMenuHarnessTest);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should get submenus', async () => {
      const menu1 = await loader.getHarness(MatMenuHarness.with({triggerText: 'Menu 1'}));

      await menu1.open();
      let submenus = await menu1.getItems({hasSubmenu: true});
      expect(submenus.length).toBe(2);
      const menu2 = (await submenus[0].getSubmenu())!;
      const menu3 = (await submenus[1].getSubmenu())!;
      expect(await menu2.getTriggerText()).toBe('Menu 2');
      expect(await menu3.getTriggerText()).toBe('Menu 3');

      await menu2.open();
      expect((await menu2.getItems({hasSubmenu: true})).length).toBe(0);

      await menu3.open();
      submenus = await menu3.getItems({hasSubmenu: true});
      expect(submenus.length).toBe(1);
      const menu4 = (await submenus[0].getSubmenu())!;
      expect(await menu4.getTriggerText()).toBe('Menu 4');

      await menu4.open();
      expect((await menu4.getItems({hasSubmenu: true})).length).toBe(0);
    });

    it('should select item in top-level menu', async () => {
      const menu1 = await loader.getHarness(MatMenuHarness.with({triggerText: 'Menu 1'}));
      await menu1.clickItem({text: /Leaf/});
      expect(fixture.componentInstance.lastClickedLeaf).toBe(1);
    });

    it('should throw when item is not found', async () => {
      const menu1 = await loader.getHarness(MatMenuHarness.with({triggerText: 'Menu 1'}));
      await expectAsync(menu1.clickItem({text: 'Fake Item'})).toBeRejectedWithError(
        /Could not find item matching {"text":"Fake Item"}/,
      );
    });

    it('should select item in nested menu', async () => {
      const menu1 = await loader.getHarness(MatMenuHarness.with({triggerText: 'Menu 1'}));
      await menu1.clickItem({text: 'Menu 3'}, {text: 'Menu 4'}, {text: /Leaf/});
      expect(fixture.componentInstance.lastClickedLeaf).toBe(3);
    });

    it('should throw when intermediate item does not have submenu', async () => {
      const menu1 = await loader.getHarness(MatMenuHarness.with({triggerText: 'Menu 1'}));
      await expectAsync(menu1.clickItem({text: 'Leaf Item 1'}, {})).toBeRejectedWithError(
        /Item matching {"text":"Leaf Item 1"} does not have a submenu/,
      );
    });
  });
});

@Component({
  template: `
      <button type="button" id="settings" [matMenuTriggerFor]="settingsMenu">Settings</button>
      <button type="button" disabled [matMenuTriggerFor]="settingsMenu">Disabled menu</button>

      <mat-menu #settingsMenu>
        <menu mat-menu-item>Profile</menu>
        <menu mat-menu-item>Account</menu>
      </mat-menu>
  `,
  imports: [MatMenuModule],
})
class MenuHarnessTest {}

@Component({
  template: `
      <button [matMenuTriggerFor]="menu1">Menu 1</button>

      <mat-menu #menu1>
        <button mat-menu-item [matMenuTriggerFor]="menu2">Menu 2</button>
        <button mat-menu-item (click)="lastClickedLeaf = 1">Leaf Item 1</button>
        <button mat-menu-item [matMenuTriggerFor]="menu3">Menu 3</button>
      </mat-menu>

      <mat-menu #menu2>
        <button mat-menu-item (click)="lastClickedLeaf = 2">Leaf Item 2</button>
      </mat-menu>

      <mat-menu #menu3>
        <button mat-menu-item [matMenuTriggerFor]="menu4">Menu 4</button>
      </mat-menu>

      <mat-menu #menu4>
        <button mat-menu-item (click)="lastClickedLeaf = 3">Leaf Item 3</button>
      </mat-menu>
  `,
  imports: [MatMenuModule],
})
class NestedMenuHarnessTest {
  lastClickedLeaf = 0;
}
