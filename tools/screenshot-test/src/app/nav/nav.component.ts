import { Component, OnInit } from '@angular/core';
import {FirebaseService} from '../firebase.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  get user() {
    return this._service.user;
  }

  constructor(private _service: FirebaseService) { }

  signInGithub() {
    this._service.signInGithub();
  }

  signOutGithub() {
    this._service.signOutGithub();
  }
}
