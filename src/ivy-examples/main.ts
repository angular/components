import {Component, ɵrenderComponent as renderComponent} from '@angular/core';

@Component({
  template: `Hello world`,
  selector: 'ivy-examples',
})
class IvyExampleApp {}

renderComponent(IvyExampleApp);
