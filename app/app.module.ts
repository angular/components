import { NgModule } from '@angular/core';


import {MatDatepickerModule} from "./datepicker";
import {MatFormFieldModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';


@NgModule({
  declarations: [
  ],
  imports: [
      BrowserModule,

      MatDatepickerModule,
      MatFormFieldModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
