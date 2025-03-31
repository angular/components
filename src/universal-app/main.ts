// TODO(devversion): Remove when APF ships pre-linked output.
import '@angular/compiler';

import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {AUTOMATED_KITCHEN_SINK, KitchenSink} from './kitchen-sink/kitchen-sink';

bootstrapApplication(KitchenSink, {
  providers: [
    provideAnimations(),
    provideClientHydration(),
    {
      provide: AUTOMATED_KITCHEN_SINK,
      useValue: false,
    },
  ],
});
