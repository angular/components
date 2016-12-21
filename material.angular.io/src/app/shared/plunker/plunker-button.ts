import { Component, Input } from '@angular/core';
import { PlunkerWriter } from './plunker-writer';
import { ExampleData } from '../../examples/example-data';

@Component({
  selector: 'plunker-button',
  templateUrl: './plunker-button.html',
  providers: [PlunkerWriter],
})
export class PlunkerButton {
  exampleData: ExampleData;

  @Input()
  set example(example: string) {
     this.exampleData = new ExampleData(example);
  }

  constructor(private plunkerWriter: PlunkerWriter) {}

  openPlunker(): void {
    this.plunkerWriter.openPlunker(this.exampleData);
  }
}
