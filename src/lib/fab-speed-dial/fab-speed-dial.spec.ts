import {async, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {MdIconModule} from '../icon/index';
import {By} from '@angular/platform-browser';
import {MdButtonModule} from '../button/index';
import {
  MdFabSpeedDialModule,
  MdFabSpeedDialComponent,
  MdFabSpeedDialTrigger
} from './fab-speed-dial';

describe('MdFabSpeedDial', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdFabSpeedDialModule.forRoot(), MdButtonModule.forRoot(), MdIconModule.forRoot()],
      declarations: [FABSpeedDialTestApp]
    });

    TestBed.compileComponents();
  }));

  it('should only apply class mat-up when direction is up', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.direction = 'up';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).toContain('mat-up');
    expect(speedDial.nativeElement.classList).not.toContain('mat-down');
    expect(speedDial.nativeElement.classList).not.toContain('mat-left');
    expect(speedDial.nativeElement.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-down when direction is down', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.direction = 'down';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).not.toContain('mat-up');
    expect(speedDial.nativeElement.classList).toContain('mat-down');
    expect(speedDial.nativeElement.classList).not.toContain('mat-left');
    expect(speedDial.nativeElement.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-left when direction is left', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.direction = 'left';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).not.toContain('mat-up');
    expect(speedDial.nativeElement.classList).not.toContain('mat-down');
    expect(speedDial.nativeElement.classList).toContain('mat-left');
    expect(speedDial.nativeElement.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-right when direction is right', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.direction = 'right';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).not.toContain('mat-up');
    expect(speedDial.nativeElement.classList).not.toContain('mat-down');
    expect(speedDial.nativeElement.classList).not.toContain('mat-left');
    expect(speedDial.nativeElement.classList).toContain('mat-right');
  });

  it('should only apply class mat-fling when animationMode is fling', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.animationMode = 'fling';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).toContain('mat-fling');
    expect(speedDial.nativeElement.classList).not.toContain('mat-scale');
  });

  it('should only apply class mat-scale when animationMode is scale', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    testComponent.animationMode = 'scale';
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).not.toContain('mat-fling');
    expect(speedDial.nativeElement.classList).toContain('mat-scale');
  });

  it('should apply class mat-opened when is opened', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

    expect(speedDial.nativeElement.classList).not.toContain('mat-opened');

    testComponent.open = true;
    fixture.detectChanges();

    expect(speedDial.nativeElement.classList).toContain('mat-opened');
  });

  describe('toggle', () => {
    it('should change the open state', () => {
      let fixture = TestBed.createComponent(FABSpeedDialTestApp);

      let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));

      expect(speedDial.componentInstance.open).toBe(false);

      speedDial.componentInstance.toggle();

      expect(speedDial.componentInstance.open).toBe(true);
    });
  });

  describe('MdFabSpeedDialTrigger', () => {
    it('click should open the speed dial when it is closed', () => {
      let fixture = TestBed.createComponent(FABSpeedDialTestApp);

      let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));
      let trigger = fixture.debugElement.query(By.directive(MdFabSpeedDialTrigger));

      speedDial.componentInstance.open = false;

      trigger.nativeElement.click();
      fixture.detectChanges();

      expect(speedDial.componentInstance.open).toBe(true);
    });

    it('click should close the speed dial when it is opened', () => {
      let fixture = TestBed.createComponent(FABSpeedDialTestApp);

      let speedDial = fixture.debugElement.query(By.directive(MdFabSpeedDialComponent));
      let trigger = fixture.debugElement.query(By.directive(MdFabSpeedDialTrigger));

      speedDial.componentInstance.open = true;

      trigger.nativeElement.click();
      fixture.detectChanges();

      expect(speedDial.componentInstance.open).toBe(false);
    });

    it('should apply class mat-spin when spin option is true', () => {
      let fixture = TestBed.createComponent(FABSpeedDialTestApp);

      let testComponent = fixture.debugElement.componentInstance;
      let trigger = fixture.debugElement.query(By.directive(MdFabSpeedDialTrigger));

      expect(trigger.nativeElement.classList).not.toContain('mat-spin');

      testComponent.spin = true;
      fixture.detectChanges();

      expect(trigger.nativeElement.classList).toContain('mat-spin');
    });
  });

});


@Component({
  template: `
  <md-fab-speed-dial 
    [(open)]="open" [direction]="direction" 
    [animationMode]="animationMode" [fixed]="fixed">
    
    <md-fab-trigger [spin]="spin">
      <button md-fab><md-icon>add</md-icon></button>
    </md-fab-trigger>

    <md-fab-actions>
      <button md-mini-fab><md-icon>done</md-icon></button>
      <button md-mini-fab><md-icon>edit</md-icon></button>
      <button md-mini-fab><md-icon>home</md-icon></button>
    </md-fab-actions>
  </md-fab-speed-dial>
  `
})
class FABSpeedDialTestApp {
  open: boolean;
  direction: string;
  animationMode: string;
  fixed: boolean;
  spin: boolean;
}

