# MapMarker

The `MapMarker` component wraps the [`google.maps.Marker` class](https://developers.google.com/maps/documentation/javascript/reference/marker#Marker) from the Google Maps JavaScript API. The `MapMarker` component displays a marker on the map when it is a content child of a `GoogleMap` component. Like `GoogleMap`, this component offers an `options` input as well as convenience inputs for `position`, `title`, `label`, and `clickable`, and supports all `google.maps.Marker` events as outputs.

**Note:** As of 2024, Google Maps has deprecated the `Marker` class. Consider using the `map-advanced-marker` instead.

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapMarker} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapMarker],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];

  addMarker(event: google.maps.MapMouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }
}
```

```html
<!-- google-map-demo.component.html -->
<google-map
  height="400px"
  width="750px"
  [center]="center"
  [zoom]="zoom"
  (mapClick)="addMarker($event)">
    @for (position of markerPositions; track position) {
      <map-marker [position]="position" [options]="markerOptions" />
    }
</google-map>
```
