import {Component} from '@angular/core';
import {MatAnchor} from '@angular/material/button';
import {Footer} from '../../shared/footer/footer';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  standalone: true,
  imports: [MatAnchor, RouterLink, Footer],
  host: {
    'class': 'main-content',
  },
})
export class NotFound {}
