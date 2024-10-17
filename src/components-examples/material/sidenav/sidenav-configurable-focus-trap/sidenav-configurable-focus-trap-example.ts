import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {ConfigurableFocusTrapFactory, FocusTrapFactory} from '@angular/cdk/a11y';

/** @title Sidenav using injected ConfigurableFocusTrap */
@Component({
  selector: 'sidenav-configurable-focus-trap-example',
  templateUrl: 'sidenav-configurable-focus-trap-example.html',
  styleUrl: 'sidenav-configurable-focus-trap-example.css',
  imports: [MatSidenavModule, MatButtonModule, MatRadioModule, FormsModule, ReactiveFormsModule],
  providers: [{provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory}],
})
export class SidenavConfigurableFocusTrapExample {
  mode = new FormControl('over' as MatDrawerMode);
  hasBackdrop = new FormControl(null as null | boolean);
  position = new FormControl('start' as 'start' | 'end');

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
