import {Component} from '@angular/core';
import {MatButton, MatFabButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

/**
 * @title Interactive disabled buttons
 */
@Component({
  selector: 'button-disabled-interactive-example',
  templateUrl: 'button-disabled-interactive-example.html',
  styleUrl: 'button-disabled-interactive-example.css',
  imports: [MatButton, MatFabButton, MatMiniFabButton, MatIcon, MatTooltip],
})
export class ButtonDisabledInteractiveExample {}
