import {Component, HostBinding} from '@angular/core';

@Component({
  selector: 'app-logo',
  styleUrl: 'logo.scss',
  templateUrl: './logo.html',
})
export class AppLogo {
  @HostBinding('attr.aria-hidden')
  ariaHidden = true;
}
