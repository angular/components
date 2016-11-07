import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdChip, MdChipsModule} from './index';

describe('Chip Remove', () => {
  let fixture: ComponentFixture<any>;
  let testChip: TestChip;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule],
      declarations: [
        TestChip
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    chipDebugElement = fixture.debugElement.query(By.directive(MdChip));
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('applies the `mat-chip-remove` CSS class', () => {
      let hrefElement = chipNativeElement.querySelector('a');

      expect(hrefElement.classList).toContain('mat-chip-remove');
    });

    it('emits (remove) on click', () => {
      let hrefElement = chipNativeElement.querySelector('a');

      testChip.removable = true;
      fixture.detectChanges();

      spyOn(testChip, 'didRemove');

      hrefElement.click();

      expect(testChip.didRemove).toHaveBeenCalled();
    });

    it(`monitors the parent chip's [removable] property`, () => {
      let hrefElement = chipNativeElement.querySelector('a');

      testChip.removable = true;
      fixture.detectChanges();

      expect(hrefElement.classList).not.toContain('mat-chip-remove-hidden');

      testChip.removable = false;
      fixture.detectChanges();

      expect(hrefElement.classList).toContain('mat-chip-remove-hidden');
    });
  });
});

@Component({
  template: `
    <md-chip [removable]="removable" (remove)="didRemove()"><a md-chip-remove></a></md-chip>
  `
})
class TestChip {
  removable: boolean;

  didRemove() {}
}
