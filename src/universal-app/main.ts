import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {AUTOMATED_KITCHEN_SINK, KitchenSink} from './kitchen-sink/kitchen-sink';

bootstrapApplication(KitchenSink, {
  providers: [
    provideClientHydration(),
    {
      provide: AUTOMATED_KITCHEN_SINK,
      useValue: false,
    },
  ],
});
