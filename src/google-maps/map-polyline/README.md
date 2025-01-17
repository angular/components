# MapPolyline

The `MapPolyline` component wraps the [`google.maps.Polyline` class](https://developers.google.com/maps/documentation/javascript/reference/polygon#Polyline) from the Google Maps JavaScript API.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapPolyline} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapPolyline],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  vertices: google.maps.LatLngLiteral[] = [
    {lat: 13, lng: 13},
    {lat: -13, lng: 0},
    {lat: 13, lng: -13},
  ];
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px" width="750px" [center]="center" [zoom]="zoom">
  <map-polyline [path]="vertices" />
</google-map>
```
