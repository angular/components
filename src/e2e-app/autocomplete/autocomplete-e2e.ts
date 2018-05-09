import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'autocomplete-e2e',
  templateUrl: 'autocomplete-e2e.html',
})
export class AutocompleteE2E {
  optionCtrl = new FormControl();
  filteredOptions: Observable<string[]>;
  options = ['One', 'Two', 'Three', 'Four'];

  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChildren(MatOption) matOptions: QueryList<MatOption>;

  constructor() {
    this.filteredOptions = this.optionCtrl.valueChanges.pipe(
      startWith(null),
      map((val: string) => {
        return val ? this.options.filter(option => option.startsWith(val)) : this.options.slice();
      }));
  }
}
