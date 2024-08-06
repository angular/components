import {CommonModule} from '@angular/common';
import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatToolbarModule} from './index';

describe('MatToolbar', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        CommonModule,
        ToolbarSingleRow,
        ToolbarMultipleRows,
        ToolbarMixedRowModes,
        ToolbarMultipleIndirectRows,
      ],
    });
  }));

  describe('with single row', () => {
    let fixture: ComponentFixture<ToolbarSingleRow>;
    let testComponent: ToolbarSingleRow;
    let toolbarElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ToolbarSingleRow);
      testComponent = fixture.debugElement.componentInstance;
      toolbarElement = fixture.debugElement.query(By.css('.mat-toolbar'))!.nativeElement;
    });

    it('should apply class based on color attribute', () => {
      testComponent.toolbarColor.set('primary');
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-primary')).toBe(true);

      testComponent.toolbarColor.set('accent');
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-primary')).toBe(false);
      expect(toolbarElement.classList.contains('mat-accent')).toBe(true);

      testComponent.toolbarColor.set('warn');
      fixture.detectChanges();

      expect(toolbarElement.classList.contains('mat-accent')).toBe(false);
      expect(toolbarElement.classList.contains('mat-warn')).toBe(true);
    });

    it('should not wrap the first row contents inside of a generated element', () => {
      expect(toolbarElement.firstElementChild!.tagName)
        .withContext(
          'Expected the <span> element of the first row to be a direct child ' + 'of the toolbar',
        )
        .toBe('SPAN');
    });
  });

  describe('with multiple rows', () => {
    it('should project each toolbar-row element inside of the toolbar', () => {
      const fixture = TestBed.createComponent(ToolbarMultipleRows);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.mat-toolbar > .mat-toolbar-row')).length)
        .withContext('Expected one toolbar row to be present while no content is projected.')
        .toBe(2);
    });

    it('should throw an error if different toolbar modes are mixed', () => {
      expect(() => {
        const fixture = TestBed.createComponent(ToolbarMixedRowModes);
        fixture.detectChanges();
      }).toThrowError(/attempting to combine different/i);
    });

    it('should throw an error if a toolbar-row is added later', async () => {
      const fixture = TestBed.createComponent(ToolbarMixedRowModes);

      await expectAsync(
        (async () => {
          fixture.componentInstance.showToolbarRow.set(false);
          fixture.detectChanges();
          await fixture.whenStable();

          fixture.componentInstance.showToolbarRow.set(true);
          fixture.detectChanges();
          await fixture.whenStable();
        })(),
      ).toBeRejectedWithError(/attempting to combine different/i);
    });

    it('should pick up indirect descendant rows', () => {
      const fixture = TestBed.createComponent(ToolbarMultipleIndirectRows);
      fixture.detectChanges();
      const toolbar = fixture.nativeElement.querySelector('.mat-toolbar');

      expect(toolbar.classList).toContain('mat-toolbar-multiple-rows');
    });
  });
});

@Component({
  template: `
    <mat-toolbar [color]="toolbarColor()">
      <span>First Row</span>
    </mat-toolbar>
  `,
  standalone: true,
  imports: [MatToolbarModule, CommonModule],
})
class ToolbarSingleRow {
  toolbarColor = signal('');
}

@Component({
  template: `
    <mat-toolbar>
      <mat-toolbar-row>First Row</mat-toolbar-row>
      <mat-toolbar-row>Second Row</mat-toolbar-row>
    </mat-toolbar>
  `,
  standalone: true,
  imports: [MatToolbarModule, CommonModule],
})
class ToolbarMultipleRows {}

@Component({
  template: `
    <mat-toolbar>
      First Row
      @if (showToolbarRow) {
        <mat-toolbar-row>Second Row</mat-toolbar-row>
      }
    </mat-toolbar>
  `,
  standalone: true,
  imports: [MatToolbarModule, CommonModule],
})
class ToolbarMixedRowModes {
  showToolbarRow = signal(true);
}

@Component({
  // The ng-container is there so we have a node with a directive between the toolbar and the rows.
  template: `
    <mat-toolbar>
      @if (true) {
        <mat-toolbar-row>First Row</mat-toolbar-row>
        <mat-toolbar-row>Second Row</mat-toolbar-row>
      }
    </mat-toolbar>
  `,
  standalone: true,
  imports: [MatToolbarModule, CommonModule],
})
class ToolbarMultipleIndirectRows {}
