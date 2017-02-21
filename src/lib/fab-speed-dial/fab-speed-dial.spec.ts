import {async, TestBed} from "@angular/core/testing";
import {Component} from "@angular/core";
import {MdIconModule} from "../icon/index";
import {MdButtonModule} from "../button/index";
import {MdFabSpeedDialModule} from "./fab-speed-dial";

// TODO
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
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.direction = 'up';
    fixture.detectChanges();

    expect(speedDial.classList).toContain('mat-up');
    expect(speedDial.classList).not.toContain('mat-down');
    expect(speedDial.classList).not.toContain('mat-left');
    expect(speedDial.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-down when direction is down', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.direction = 'down';
    fixture.detectChanges();

    expect(speedDial.classList).not.toContain('mat-up');
    expect(speedDial.classList).toContain('mat-down');
    expect(speedDial.classList).not.toContain('mat-left');
    expect(speedDial.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-left when direction is left', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.direction = 'left';
    fixture.detectChanges();

    expect(speedDial.classList).not.toContain('mat-up');
    expect(speedDial.classList).not.toContain('mat-down');
    expect(speedDial.classList).toContain('mat-left');
    expect(speedDial.classList).not.toContain('mat-right');
  });

  it('should only apply class mat-right when direction is right', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.direction = 'right';
    fixture.detectChanges();

    expect(speedDial.classList).not.toContain('mat-up');
    expect(speedDial.classList).not.toContain('mat-down');
    expect(speedDial.classList).not.toContain('mat-left');
    expect(speedDial.classList).toContain('mat-right');
  });

  it('should only apply class mat-fling when animationMode is fling', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.animationMode = 'fling';
    fixture.detectChanges();

    expect(speedDial.classList).toContain('mat-fling');
    expect(speedDial.classList).not.toContain('mat-scale');
  });

  it('should only apply class mat-scale when animationMode is scale', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    testComponent.animationMode = 'scale';
    fixture.detectChanges();

    expect(speedDial.classList).not.toContain('mat-fling');
    expect(speedDial.classList).toContain('mat-scale');
  });

  it('should apply class mat-opened when is opened', () => {
    let fixture = TestBed.createComponent(FABSpeedDialTestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let speedDial = fixture.debugElement.nativeElement.querySelector('md-fab-speed-dial');

    expect(speedDial.classList).not.toContain('mat-opened');

    testComponent.open = true;
    fixture.detectChanges();

    expect(speedDial.classList).toContain('mat-opened');
  });

});


@Component({
  template: `
  <md-fab-speed-dial [(open)]="open" [direction]="direction" [animationMode]="animationMode" [fixed]="fixed">
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
  private fixed: boolean;
  spin: boolean;
}

