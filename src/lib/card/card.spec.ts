import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  MdCard,
  MdCardModule
} from './index';

describe('MdCard', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdCardModule],
      declarations: [
        CardWithCustomElevation
      ],
    });

    TestBed.compileComponents();
  }));

  describe('with elevation', () => {

    let fixture: ComponentFixture<CardWithCustomElevation>;
    let cardElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let testComponent: CardWithCustomElevation;

    beforeEach(() => {
      fixture = TestBed.createComponent(CardWithCustomElevation);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      cardElement = fixture.debugElement.query(By.directive(MdCard));
    });

    it('should not have any mat-elevation-z[X] class by default', () => {
      expect(cardElement.nativeElement.classList.length)
          .toBe(1, 'should have exactly 1 class');
      expect(cardElement.nativeElement.classList).toContain('mat-card');
    });

    it('should set the mat-elevation-z[X] according to the elevation input', () => {
      testComponent.elevation = 11;
      fixture.detectChanges();

      expect(cardElement.nativeElement.classList.length)
          .toBe(2, 'should have exactly 2 classes');
      expect(cardElement.nativeElement.classList).toContain('mat-card');
      expect(cardElement.nativeElement.classList).toContain('mat-elevation-z11');
    });

    it('should not set the mat-elevation-z[X] when out of range', () => {
      testComponent.elevation = -1;
      fixture.detectChanges();

      expect(cardElement.nativeElement.classList.length)
          .toBe(1, 'should have exactly 1 class');
      expect(cardElement.nativeElement.classList).toContain('mat-card');

      testComponent.elevation = 25;
      fixture.detectChanges();

      expect(cardElement.nativeElement.classList.length)
          .toBe(1, 'should have exactly 1 class');
      expect(cardElement.nativeElement.classList).toContain('mat-card');
    });

    it('should remove the previous mat-elevation-z[X] class', () => {
      testComponent.elevation = 11;
      fixture.detectChanges();

      expect(cardElement.nativeElement.classList.length)
          .toBe(2, 'should have exactly 2 classes');
      expect(cardElement.nativeElement.classList).toContain('mat-card');
      expect(cardElement.nativeElement.classList).toContain('mat-elevation-z11');

      testComponent.elevation = 14;
      fixture.detectChanges();

      expect(cardElement.nativeElement.classList).toContain('mat-card');
      expect(cardElement.nativeElement.classList).not.toContain('mat-elevation-z11');
      expect(cardElement.nativeElement.classList).toContain('mat-elevation-z14');
    });
  });

});

@Component({
  template: `
  <md-card [elevation]="elevation">
    My Card Content
  </md-card>
  `
})
class CardWithCustomElevation {
  elevation: number;
}
