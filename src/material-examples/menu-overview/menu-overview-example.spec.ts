import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuOverviewExample } from './menu-overview-example';
import {
  MatMenuModule,
  MatButtonModule
} from '@angular/material';
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

describe('TestComponent', () => {
  let dom;
  let button;
  let component: MenuOverviewExample;
  let fixture: ComponentFixture<MenuOverviewExample>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MenuOverviewExample],
      imports: [MatMenuModule, MatButtonModule, NoopAnimationsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuOverviewExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dom = fixture.nativeElement;
    button = dom.querySelector('button[mat-button]');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a button', () => {
    expect(button).toBeTruthy();
  });

  it('should create a menu when clicked', () => {
    button.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.parentNode.querySelector('.mat-menu-panel')
    ).toBeTruthy();
  });

  it('should not have a menu if button not pressed', () => {
    fixture.detectChanges();
    expect(
      fixture.nativeElement.parentNode.querySelector('.mat-menu-panel')
    ).toBeFalsy();
  });

  it('the menu should have 2 menu items', () => {
    button.click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.parentNode.querySelectorAll('button[mat-menu-item]')
        .length
    ).toBe(2);
  });
});