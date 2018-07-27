import {TestBed, async, ComponentFixture, fakeAsync, tick} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {Location} from '@angular/common';
import {MatProgressBarModule} from './index';
import { MatProgressBar } from './progress-bar';


describe('MatProgressBar', () => {
  let fakePath = '/fake-path';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatProgressBarModule],
      declarations: [
        BasicProgressBar,
        BufferProgressBar,
      ],
      providers: [{
        provide: Location,
        useValue: {path: () => fakePath}
      }]
    });

    TestBed.compileComponents();
  }));


  describe('basic progress-bar', () => {
    let fixture: ComponentFixture<BasicProgressBar>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicProgressBar);
      fixture.detectChanges();
    });

    it('should apply a mode of "determinate" if no mode is provided.', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('determinate');
    });

    it('should define default values for value and bufferValue attributes', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.value).toBe(0);
      expect(progressElement.componentInstance.bufferValue).toBe(0);
    });

    it('should clamp value and bufferValue between 0 and 100', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      let progressComponent = progressElement.componentInstance;

      progressComponent.value = 50;
      expect(progressComponent.value).toBe(50);

      progressComponent.value = 999;
      expect(progressComponent.value).toBe(100);

      progressComponent.value = -10;
      expect(progressComponent.value).toBe(0);

      progressComponent.bufferValue = -29;
      expect(progressComponent.bufferValue).toBe(0);

      progressComponent.bufferValue = 9;
      expect(progressComponent.bufferValue).toBe(9);

      progressComponent.bufferValue = 1320;
      expect(progressComponent.bufferValue).toBe(100);
    });

    it('should return the transform attribute for bufferValue and mode', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      let progressComponent = progressElement.componentInstance;

      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.value = 40;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.4)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.value = 35;
      progressComponent.bufferValue = 55;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.35)'});
      expect(progressComponent._bufferTransform()).toBe(undefined);

      progressComponent.mode = 'buffer';
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.35)'});
      expect(progressComponent._bufferTransform()).toEqual({transform: 'scaleX(0.55)'});


      progressComponent.value = 60;
      progressComponent.bufferValue = 60;
      expect(progressComponent._primaryTransform()).toEqual({transform: 'scaleX(0.6)'});
      expect(progressComponent._bufferTransform()).toEqual({transform: 'scaleX(0.6)'});
    });

    it('should prefix SVG references with the current path', () => {
      const rect = fixture.debugElement.query(By.css('rect')).nativeElement;
      expect(rect.getAttribute('fill')).toMatch(/^url\(\/fake-path#.*\)$/);
    });

    it('should not be able to tab into the underlying SVG element', () => {
      const svg = fixture.debugElement.query(By.css('svg')).nativeElement;
      expect(svg.getAttribute('focusable')).toBe('false');
    });
  });

  describe('buffer progress-bar', () => {
    let fixture: ComponentFixture<BufferProgressBar>;

    beforeEach(() => {
      fixture = TestBed.createComponent(BufferProgressBar);
      fixture.detectChanges();
    });

    it('should not modify the mode if a valid mode is provided.', () => {
      let progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressElement.componentInstance.mode).toBe('buffer');
    });
  });

  describe('animation trigger on determinate setting', () => {
    let fixture: ComponentFixture<BasicProgressBar>;
    let progressComponent: MatProgressBar;
    let primaryValueBar: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      progressComponent = progressElement.componentInstance;
      primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'));
    });

    it('should trigger output event on primary value bar animation end', () => {
      spyOn(progressComponent.valueAnimationEnd, "next");

      progressComponent.value = 40;
      dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
      expect(progressComponent.valueAnimationEnd.next).toHaveBeenCalledWith(40);
    });
  });

  describe('animation trigger on buffer setting', () => {
    let fixture: ComponentFixture<BufferProgressBar>;
    let progressComponent: MatProgressBar;
    let primaryValueBar: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BufferProgressBar);
      fixture.detectChanges();

      const progressElement = fixture.debugElement.query(By.css('mat-progress-bar'));
      progressComponent = progressElement.componentInstance;
      primaryValueBar = progressElement.query(By.css('.mat-progress-bar-primary'));
    });

    it('should trigger output event with value not bufferValue', () => {
      spyOn(progressComponent.valueAnimationEnd, "next");

      progressComponent.value = 40;
      progressComponent.bufferValue = 70;
      dispatchFakeEvent(primaryValueBar.nativeElement, 'transitionend');
      expect(progressComponent.valueAnimationEnd.next).toHaveBeenCalledWith(40);
    });
  });
});


@Component({template: '<mat-progress-bar></mat-progress-bar>'})
class BasicProgressBar { }

@Component({template: '<mat-progress-bar mode="buffer"></mat-progress-bar>'})
class BufferProgressBar { }
