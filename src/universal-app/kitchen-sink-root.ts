import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ServerModule} from '@angular/platform-server';
import {KitchenSinkMdcModule} from './kitchen-sink-mdc/kitchen-sink-mdc';
import {KitchenSinkModule} from './kitchen-sink/kitchen-sink';

@Component({
  selector: 'kitchen-sink-root',
  template: `
    <div class="kitchen-sink-row">
      <kitchen-sink class="kitchen-sink"></kitchen-sink>
      <kitchen-sink-mdc class="kitchen-sink"></kitchen-sink-mdc>
    </div>
  `,
  styles: [`
    /**
      Align both components (the non-MDC and MDC kitchen-sinks) next to each other.
      This reduces the overall height of the page and makes it easier to capture
      in screenshot tests where browsers (even headless ones) seem to have a limit.
    */
    .kitchen-sink-row {
      display: flex;
      flex-direction: row;
    }

    /** Add padding for the kitchen-sink components, and expand them equally in the row. */
    .kitchen-sink {
      flex: 1;
      padding: 16px;
    }

    /** The first kitchen-sink should have a border to split up the two components visually. */
    .kitchen-sink:first-child {
      border-right: 2px solid grey;
    }
  `]
})
export class KitchenSinkRoot {
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'kitchen-sink'}),
    KitchenSinkMdcModule,
    KitchenSinkModule
  ],
  declarations: [KitchenSinkRoot],
  exports: [KitchenSinkRoot],
  bootstrap: [KitchenSinkRoot],
})
export class KitchenSinkRootModule {
}

@NgModule({
  imports: [KitchenSinkRootModule, ServerModule],
  bootstrap: [KitchenSinkRoot],
})
export class KitchenSinkRootServerModule {
}
