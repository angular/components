import {Component} from '@angular/core';
import {AppLogo} from '../logo/logo';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [AppLogo],
  standalone: true,
})
export class Footer {
  year = new Date().getFullYear();
}
