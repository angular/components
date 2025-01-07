import {QueryList, ViewChild, ViewChildren, Component} from '@angular/core';
import {CdkMenu} from './menu';
import {CdkMenuBar} from './menu-bar';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CdkMenuTrigger} from './menu-trigger';
import {MenuStack} from './menu-stack';
import {CdkMenuModule} from './menu-module';

describe('MenuStack', () => {
  let fixture: ComponentFixture<MultiMenuWithSubmenu>;
  let menuStack: MenuStack;
  let triggers: CdkMenuTrigger[];
  let menus: CdkMenu[];

  /** Fetch triggers, menus and the menu stack from the test component.  */
  function getElementsForTesting() {
    fixture.detectChanges();
    triggers = fixture.componentInstance.triggers.toArray();
    menus = fixture.componentInstance.menus.toArray();
    menuStack = fixture.componentInstance.menuBar.menuStack;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkMenuModule, MultiMenuWithSubmenu],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiMenuWithSubmenu);
    fixture.detectChanges();

    getElementsForTesting();
  });

  /** Open up all of the menus in the test component. */
  function openAllMenus() {
    triggers[0].open();
    getElementsForTesting();
    triggers[1].open();
    getElementsForTesting();
    triggers[2].open();
    getElementsForTesting();
  }

  it(
    'should fill the menu stack with the latest menu at the end of the stack and oldest at' +
      ' the start of the stack',
    () => {
      openAllMenus();
      expect(menus.length).toBe(3);
      const spy = jasmine.createSpy('menu stack closed spy');

      menuStack.closed.subscribe(spy);
      menuStack.closeAll();

      expect(spy).toHaveBeenCalledTimes(3);
      const callArgs = spy.calls.all().map((v: jasmine.CallInfo<jasmine.Func>) => v.args[0].item);
      expect(callArgs).toEqual(menus.reverse());
      expect(menuStack.isEmpty()).toBeTrue();
    },
  );

  it('should close triggering menu and all menus below it', () => {
    openAllMenus();
    expect(menus.length).toBe(3);

    triggers[1].toggle();
    getElementsForTesting();

    expect(menus.length).toBe(1);
    expect(menuStack.length()).withContext('menu stack should only have the single menu').toBe(1);
    expect(menuStack.peek()).toEqual(menus[0]);
  });
});

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
      </div>

      <ng-template #file>
        <div cdkMenu id="file_menu">
          <button cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
        </div>
      </ng-template>

      <ng-template #share>
        <div cdkMenu id="share_menu">
          <button cdkMenuItem [cdkMenuTriggerFor]="chat">Chat</button>
        </div>
      </ng-template>

      <ng-template #chat>
        <div cdkMenu id="chat_menu">
          <button cdkMenuItem>GVC</button>
        </div>
      </ng-template>
    </div>
  `,
  imports: [CdkMenuModule],
})
class MultiMenuWithSubmenu {
  @ViewChild(CdkMenuBar) menuBar: CdkMenuBar;

  @ViewChildren(CdkMenuTrigger) triggers: QueryList<CdkMenuTrigger>;
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}
