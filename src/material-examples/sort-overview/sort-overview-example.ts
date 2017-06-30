import {Component} from '@angular/core';
import {Sort} from '@angular/material';


@Component({
  selector: 'sort-overview-example',
  templateUrl: 'sort-overview-example.html',
  styleUrls: ['sort-overview-example.css'],
})
export class SortOverviewExample {
  desserts = [
    {name: 'Frozen yogurt', calories: '159', fat: '6', carbs: '24', protein: '4'},
    {name: 'Ice cream sandwich', calories: '237', fat: '9', carbs: '37', protein: '4'},
    {name: 'Eclair', calories: '262', fat: '16', carbs: '24', protein: '6'},
    {name: 'Cupcake', calories: '305', fat: '4', carbs: '67', protein: '4'},
    {name: 'Gingerbread', calories: '356', fat: '16', carbs: '49', protein: '4'},
  ];

  sortedData;

  constructor() {
    this.sortedData = this.desserts.slice();
  }

  sortData(sort: Sort) {
    const data = this.desserts.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (sort.active) {
        case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'calories': [propertyA, propertyB] = [a.calories, b.calories]; break;
        case 'fat': [propertyA, propertyB] = [a.fat, b.fat]; break;
        case 'carbs': [propertyA, propertyB] = [a.carbs, b.carbs]; break;
        case 'protein': [propertyA, propertyB] = [a.protein, b.protein]; break;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (sort.direction == 'asc' ? 1 : -1);
    });
  }
}
