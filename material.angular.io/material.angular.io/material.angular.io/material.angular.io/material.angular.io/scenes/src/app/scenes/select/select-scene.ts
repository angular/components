import {AfterViewInit, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-select-scene',
  templateUrl: './select-scene.html',
  styleUrls: ['./select-scene.scss'],
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule]
})
export class SelectScene implements AfterViewInit {
  @ViewChild(MatSelect) select!: MatSelect;

  ngAfterViewInit() {
    this.select.open();
  }
}
