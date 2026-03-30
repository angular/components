import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogState} from '../../dialog';
import {MatTestDialogOpener} from './dialog-opener';

describe('MatTestDialogOpener', () => {
  it('should open a dialog when created', async () => {
    const fixture = TestBed.createComponent(MatTestDialogOpener.withComponent(ExampleComponent));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.dialogRef.getState()).toBe(MatDialogState.OPEN);
    expect(document.querySelector('mat-dialog-container')).toBeTruthy();
  });

  it('should throw an error if no dialog component is provided', () => {
    expect(() => TestBed.createComponent(MatTestDialogOpener)).toThrow(
      Error('MatTestDialogOpener does not have a component provided.'),
    );
  });

  it('should pass data to the component', () => {
    const config = {data: 'test'};
    const fixture = TestBed.createComponent(
      MatTestDialogOpener.withComponent(ExampleComponent, config),
    );
    fixture.detectChanges();
    const dialogContainer = document.querySelector('mat-dialog-container');
    expect(dialogContainer!.innerHTML).toContain('Data: test');
  });

  it('should get closed result data', async () => {
    const config = {data: 'test'};
    const fixture = TestBed.createComponent(
      MatTestDialogOpener.withComponent<ExampleComponent, ExampleDialogResult>(
        ExampleComponent,
        config,
      ),
    );
    const closeButton = document.querySelector('#close-btn') as HTMLElement;
    closeButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(fixture.componentInstance.closedResult).toEqual({reason: 'closed'});
  });
});

interface ExampleDialogResult {
  reason: string;
}

/** Simple component for testing MatTestDialogOpener. */
@Component({
  template: `
    Data: {{data}}
    <button id="close-btn" (click)="close()">Close</button>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ExampleComponent {
  dialogRef = inject<MatDialogRef<ExampleComponent, ExampleDialogResult>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close({reason: 'closed'});
  }
}
