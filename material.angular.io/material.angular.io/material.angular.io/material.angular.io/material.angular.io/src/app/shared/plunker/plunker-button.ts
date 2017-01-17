import { Component, Input } from '@angular/core';
import { PlunkerWriter } from './plunker-writer';
import { ExampleData } from '../../examples/example-data';

@Component({
  selector: 'plunker-button',
  templateUrl: './plunker-button.html',
  providers: [PlunkerWriter],
  host: {
    '(mouseover)': 'isDisabled = !plunkerForm'
  }
})
export class PlunkerButton {
  /**
   * The button becomes disabled if the user hovers over the button before the plunker form
   * is created. After the form is created, the button becomes enabled again.
   * The form creation usually happens extremely quickly, but we handle the case of the
   * plunker not yet being ready for people will poor network connections or slow devices.
   */
  isDisabled: boolean = false;
  plunkerForm: HTMLFormElement;

  @Input()
  set example(example: string) {
    const exampleData = new ExampleData(example);
    this.plunkerWriter.constructPlunkerForm(exampleData).then(plunkerForm => {
      this.plunkerForm = plunkerForm;
      this.isDisabled = false;
    });
  }

  constructor(private plunkerWriter: PlunkerWriter) {}

  openPlunker(): void {
    this.plunkerForm.submit();
  }
}
