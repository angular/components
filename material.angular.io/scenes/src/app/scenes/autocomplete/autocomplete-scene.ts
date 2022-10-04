import {
  AfterViewInit,
  Component,
  NgModule,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInput as MatInput, MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {CommonModule, } from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-autocomplete-scene',
  templateUrl: './autocomplete-scene.html',
})
export class AutocompleteScene implements AfterViewInit {
  myControl = new FormControl('');
  options: string[] = ['hello', 'hello world'];

  @ViewChild(MatInput) input!: MatInput;

  ngAfterViewInit() {
    this.input.focus();
  }
}

@NgModule({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    CommonModule,
    FormsModule,
    NoopAnimationsModule
  ],
  exports: [AutocompleteScene],
  declarations: [AutocompleteScene],
})
export class AutocompleteSceneModule {}

