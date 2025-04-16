import {Component, inject} from '@angular/core';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogState} from '../../dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTestDialogOpener, MatTestDialogOpenerModule} from './dialog-opener';

describe('MatTestDialogOpener', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTestDialogOpenerModule, NoopAnimationsModule, ExampleComponent],
    });
  }));

  it('should open a dialog when created', fakeAsync(() => {
    const fixture = TestBed.createComponent(MatTestDialogOpener.withComponent(ExampleComponent));
    flush();
    expect(fixture.componentInstance.dialogRef.getState()).toBe(MatDialogState.OPEN);
    expect(document.querySelector('mat-dialog-container')).toBeTruthy();
  }));

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

  it('should get closed result data', fakeAsync(() => {
    const config = {data: 'test'};
    const fixture = TestBed.createComponent(
      MatTestDialogOpener.withComponent<ExampleComponent, ExampleDialogResult>(
        ExampleComponent,
        config,
      ),
    );
    flush();
    const closeButton = document.querySelector('#close-btn') as HTMLElement;
    closeButton.click();
    flush();
    expect(fixture.componentInstance.closedResult).toEqual({reason: 'closed'});
  }));
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
})
class ExampleComponent {
  dialogRef = inject<MatDialogRef<ExampleComponent, ExampleDialogResult>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close({reason: 'closed'});
  }
}
