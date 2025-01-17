# MapRectangle

The `MapRectangle` component wraps the [`google.maps.Rectangle` class](https://developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle) from the Google Maps JavaScript API.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapRectangle} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapRectangle],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  bounds: google.maps.LatLngBoundsLiteral = {
    east: 10,
    north: 10,
    south: -10,
    west: -10,
  };
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px" width="750px" [center]="center" [zoom]="zoom">
  <map-rectangle [bounds]="bounds" />
</google-map>
```
