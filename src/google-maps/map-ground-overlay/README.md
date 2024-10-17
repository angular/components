# MapGroundOverlay

The `MapGroundOverlay` component wraps the [`google.maps.GroundOverlay` class](https://developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay) from the Google Maps JavaScript API. A url and a bounds are required.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapGroundOverlay} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapGroundOverlay],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  imageUrl = 'https://angular.io/assets/images/logos/angular/angular.svg';
  imageBounds: google.maps.LatLngBoundsLiteral = {
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
  <map-ground-overlay [url]="imageUrl" [bounds]="imageBounds" />
</google-map>
```
