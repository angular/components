import {Component, Inject} from '@angular/core';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {MatTestDialogOpenerModule, MatTestDialogOpener} from '@angular/material/dialog/testing';
import {MAT_DIALOG_DATA, MatDialogState} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('MDC-based MatTestDialogOpener', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTestDialogOpenerModule, NoopAnimationsModule],
      declarations: [ExampleComponent],
    });

    TestBed.compileComponents();
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

  it('should pass data to the component', fakeAsync(() => {
    const config = {data: 'test'};
    TestBed.createComponent(MatTestDialogOpener.withComponent(ExampleComponent, config));
    flush();
    const dialogContainer = document.querySelector('mat-dialog-container');
    expect(dialogContainer!.innerHTML).toContain('Data: test');
  }));
});

/** Simple component for testing MatTestDialogOpener. */
@Component({template: 'Data: {{data}}'})
class ExampleComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
