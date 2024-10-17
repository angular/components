# MapTrafficLayer

The `MapTrafficLayer` component wraps the [`google.maps.TrafficLayer` class](https://developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer) from the Google Maps JavaScript API. `autoRefresh` is true by default.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapTrafficLayer} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapTrafficLayer],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px" width="750px" [center]="center" [zoom]="zoom">
  <map-traffic-layer [autoRefresh]="false" />
</google-map>
```
