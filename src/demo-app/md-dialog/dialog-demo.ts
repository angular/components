import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'dialog-demo',
  templateUrl: 'dialog-demo.html'
})
export class DialogDemo {
  private dialogHeader: string = 'Lorum Ipsum';

  private launchDialog(dialog: any) {
    dialog.show();
  }

  private show(dialog: any) {
    dialog.show();
  }

  private close(dialog: any) {
    dialog.close();
  }

  private showAlert(event: Event) { }
  private showConfirm(event: Event) { }
  private showPrompt(event: Event) { }
  private showAdvanced(event: Event) { }
  private showTabDialog(event: Event) { }
}
