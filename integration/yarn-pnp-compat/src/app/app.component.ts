import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MatButtonModule],
})
export class AppComponent {
  title = 'yarn-pnp-compat';
}
