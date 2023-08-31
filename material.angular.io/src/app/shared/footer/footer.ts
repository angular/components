import {Component} from '@angular/core';
import {VERSION} from '@angular/material/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  standalone: true
})
export class Footer {
  isNextVersion = location.hostname === 'next.material.angular.io';
  version = VERSION.full;
  year = new Date().getFullYear();
}
