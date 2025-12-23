import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({selector: 'app-root', template: ''})
export class App {}

bootstrapApplication(App).catch(err => console.error(err));
