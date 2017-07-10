import {async, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdExpansionModule} from './index';


describe('MdExpansionPanel', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MdExpansionModule
      ],
      declarations: [
        PanelWithContent
      ],
    });
    TestBed.compileComponents();
  }));

  it('should expand and collapse the panel', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    const contentEl = fixture.debugElement.query(By.css('.mat-expansion-panel-content'));
    const headerEl = fixture.debugElement.query(By.css('.mat-expansion-panel-header'));
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeFalsy();
    expect(contentEl.classes['mat-expanded']).toBeFalsy();

    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(headerEl.classes['mat-expanded']).toBeTruthy();
    expect(contentEl.classes['mat-expanded']).toBeTruthy();
  });

  it('emit correct events for change in panel expanded state', () => {
    const fixture = TestBed.createComponent(PanelWithContent);
    fixture.componentInstance.expanded = true;
    fixture.detectChanges();
    expect(fixture.componentInstance.openCallback).toHaveBeenCalled();

    fixture.componentInstance.expanded = false;
    fixture.detectChanges();
    expect(fixture.componentInstance.closeCallback).toHaveBeenCalled();
  });

  it('creates a unique panel id for each panel', () => {
    const fixtureOne = TestBed.createComponent(PanelWithContent);
    const headerElOne = fixtureOne.nativeElement.querySelector('.mat-expansion-panel-header');
    const fixtureTwo = TestBed.createComponent(PanelWithContent);
    const headerElTwo = fixtureTwo.nativeElement.querySelector('.mat-expansion-panel-header');
    fixtureOne.detectChanges();
    fixtureTwo.detectChanges();

    const panelIdOne = headerElOne.getAttribute('aria-controls');
    const panelIdTwo = headerElTwo.getAttribute('aria-controls');
    expect(panelIdOne).not.toBe(panelIdTwo);
  });
});


@Component({template: `
  <md-expansion-panel [expanded]="expanded"
                      (opened)="openCallback()"
                      (closed)="closeCallback()">
    <md-expansion-panel-header>Panel Title</md-expansion-panel-header>
    <p>Some content</p>
  </md-expansion-panel>`})
class PanelWithContent {
  expanded: boolean = false;
  openCallback = jasmine.createSpy('openCallback');
  closeCallback = jasmine.createSpy('closeCallback');
}
