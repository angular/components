import {Component} from '@angular/core';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [MatRadioGroup, MatRadioButton],
})
export class AppComponent {
  title = 'harness-e2e-cli';
}
