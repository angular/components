import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';

import {AppComponent} from './app.component';
import {MatRadioModule} from '@angular/material/radio';

@NgModule({
  declarations: [AppComponent],
  imports: [MatRadioModule, BrowserModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: MATERIAL_ANIMATIONS,
      useValue: {animationsDisabled: true},
    },
  ],
})
export class AppModule {}
