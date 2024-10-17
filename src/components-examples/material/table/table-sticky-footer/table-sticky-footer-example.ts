import {Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';

export interface Transaction {
  item: string;
  cost: number;
}

/**
 * @title Table with a sticky footer
 */
@Component({
  selector: 'table-sticky-footer-example',
  styleUrl: 'table-sticky-footer-example.css',
  templateUrl: 'table-sticky-footer-example.html',
  imports: [MatTableModule, CurrencyPipe],
})
export class TableStickyFooterExample {
  displayedColumns = ['item', 'cost'];
  transactions: Transaction[] = [
    {item: 'Beach ball', cost: 4},
    {item: 'Towel', cost: 5},
    {item: 'Frisbee', cost: 2},
    {item: 'Sunscreen', cost: 4},
    {item: 'Cooler', cost: 25},
    {item: 'Swim suit', cost: 15},
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}
