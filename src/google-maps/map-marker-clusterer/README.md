#MapMarkerClusterer

The `MapMarkerClusterer` component wraps the [`MarkerClusterer` class](https://googlemaps.github.io/js-markerclustererplus/classes/markerclusterer.html) from the [Google Maps JavaScript MarkerClustererPlus Library](https://github.com/googlemaps/js-markerclustererplus). The `MapMarkerClusterer` component displays a cluster of markers that are children of the `<map-marker-clusterer>` tag. Unlike the other Google Maps components, MapMarkerClusterer does not have an `options` input, so any input (listed in the [documentation](https://googlemaps.github.io/js-markerclustererplus/index.html) for the `MarkerClusterer` class) should be set directly.

## Loading the Library

Like the Google Maps JavaScript API, the MarkerClustererPlus library needs to be loaded separately. This can be accomplished by using this script tag:

```html
<script src="https://unpkg.com/@googlemaps/markerclustererplus/dist/index.min.js"></script>
```

Additional information can be found by looking at [Marker Clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering) in the Google Maps JavaScript API documentation.

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapMarker, MapMarkerClusterer} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapMarker, MapMarkerClusterer],
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;
  markerPositions: google.maps.LatLngLiteral[] = [];
  markerClustererImagePath =
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';

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
    <map-marker-clusterer [imagePath]="markerClustererImagePath">
      @for (position of markerPositions; track position) {
        <map-marker [position]="position" />
      }
    </map-marker-clusterer>
</google-map>
```
