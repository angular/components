import {Component} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material';

export class MyCustomPaginatorIntl extends MatPaginatorIntl {

  /**
   *  Default (English)
   *  A label for the range of items within the current page and the length of the whole list.
   */
  getRangeLabelDef = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 of ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} to ${endIndex} of ${length}`;
  }

    /*
     * French
     * A label for the range of items within the current page and the length of the whole list.
    */
  getRangeLabelFr = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${startIndex + 1} à ${endIndex} de ${length}`;
  }

}

/**
 * @title Change labels at runtime with custom paginator
 */
@Component({
  selector: 'paginatorintl-custom-example',
  styleUrls: ['paginatorintl-custom-example.css'],
  templateUrl: 'paginatorintl-custom-example.html',
  providers: [
    { provide: MatPaginatorIntl, useValue: new MyCustomPaginatorIntl() }
  ]
})
export class MatpaginatorintlCustomExample {
  myCustomPaginatorIntl: MyCustomPaginatorIntl;

  constructor(matPaginatorIntl: MatPaginatorIntl) {
    this.myCustomPaginatorIntl = <MyCustomPaginatorIntl>matPaginatorIntl;
    this.myCustomPaginatorIntl.getRangeLabel = this.myCustomPaginatorIntl.getRangeLabelDef;
  }

  changeToDefault() {
    this.myCustomPaginatorIntl.getRangeLabel = this.myCustomPaginatorIntl.getRangeLabelDef;
    this.myCustomPaginatorIntl.itemsPerPageLabel = 'Items per page:';
    this.myCustomPaginatorIntl.previousPageLabel = 'Previous page';
    this.myCustomPaginatorIntl.nextPageLabel = 'Next page';
    this.myCustomPaginatorIntl.changes.next();
  }

  changeToFr() {
    this.myCustomPaginatorIntl.getRangeLabel = this.myCustomPaginatorIntl.getRangeLabelFr;
    this.myCustomPaginatorIntl.itemsPerPageLabel = 'Résultats par page:';
    this.myCustomPaginatorIntl.previousPageLabel = 'Page précédente';
    this.myCustomPaginatorIntl.nextPageLabel = 'Page suivante';
    this.myCustomPaginatorIntl.changes.next();
  }

}
