import {Component} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {DecimalPipe} from '@angular/common';

export interface Product {
  name: string;
  price: number;
  insurance: number;
  category: string;
}

const PRODUCT_DATA: Product[] = [
  {name: 'Laptop', price: 999.99, insurance: 100.5, category: 'Electronics'},
  {name: 'Phone', price: 699.99, insurance: 50.5, category: 'Electronics'},
  {name: 'Tablet', price: 399.99, insurance: 25.5, category: 'Electronics'},
  {name: 'Headphones', price: 199.99, insurance: 15, category: 'Accessories'},
  {name: 'Charger', price: 49.99, insurance: 0, category: 'Accessories'},
];

/**
 * @title Demonstrates the use of `mat-text-column` with footer cells. This example includes a fixed
 * footer text for the 'name' column. The 'price' and 'insurance' columns use a text transformation
 * function to determine their footer text. The 'category' column has a default empty footer text.
 */
@Component({
  selector: 'table-text-column-with-footer-example',
  styleUrl: 'table-text-column-with-footer-example.css',
  templateUrl: 'table-text-column-with-footer-example.html',
  standalone: true,
  imports: [MatTableModule],
})
export class TableTextColumnWithFooterExample {
  nameFooterText = 'Total';
  displayedColumns: string[] = ['name', 'price', 'insurance', 'category'];
  dataSource = new MatTableDataSource(PRODUCT_DATA);

  decimalPipe = new DecimalPipe('en-US');

  /** Function to sum the values of a given column.  */
  getTotal = (column: string): string => {
    const total = PRODUCT_DATA.map(t => t[column as keyof Product] as number).reduce(
      (acc, value) => acc + value,
      0,
    );
    return this.decimalPipe.transform(total, '1.2-2') || '';
  };
}
