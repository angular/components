import {Component} from '@angular/core';
import {AppLogo} from '../logo/logo';

@Component({
  selector: 'app-support',
  templateUrl: './support.html',
  styleUrls: ['./support.scss'],
  standalone: true,
  imports: [AppLogo],
})
export class Support {}
