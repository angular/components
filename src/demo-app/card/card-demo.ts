import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'card-demo',
  templateUrl: 'card-demo.html',
  styleUrls: ['card-demo.css'],
})
export class CardDemo {
  private elevation: number;
  private elevations: number[] = Array.apply(null, {length: 24}).map((v: any, i: number) => i + 1);
}
