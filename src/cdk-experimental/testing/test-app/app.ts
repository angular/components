import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MainComponent} from './main-component';
import {SubComponent} from './sub-component';

@NgModule({
  imports: [FormsModule, BrowserModule],
  declarations: [MainComponent, SubComponent],
  exports: [MainComponent],
  bootstrap: [MainComponent],
})

export class AppModule {
}
